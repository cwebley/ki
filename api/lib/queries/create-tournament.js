import log from '../../logger';

// returns a tournament object if successful
export default function createTournamentQuery (db, opts, cb) {
	// begin transaction
	db.query('BEGIN', () => {

		addToTournamentsTable(db, opts, (err, results) => {
			if (err) {
				return rollback(db, err, cb);
			}
			addToTournamentUsersTable(db, opts, (err, results) => {
				if (err) {
					return rollback(db, err, cb);
				}
				addToTournamentCharactersTable(db, opts, (err, results) => {
					if (err) {
						return rollback(db, err, cb);
					}

					upsertToUserCharacters(db, opts, (err, results) => {
						if (err) {
							return rollback(db, err, cb);
						}

						// end transaction
						db.query('COMMIT', () => {
							// return the tournament object
							return cb(null, {
								uuid: opts.uuid,
								name: opts.name,
								slug: opts.slug,
								goal: opts.goal
							});
						});
					});
				});
			});
		});
	});
}

function addToTournamentsTable (db, opts, cb) {
	const sql = `
		INSERT INTO tournaments
			(uuid, name, slug, goal)
		VALUES
			($1, $2, $3, $4)
	`;
	const params = [opts.uuid, opts.name, opts.slug, opts.goal];

	db.query(sql, params, (err, results) => {
		if (err) {
			log.error(err, {
				sql: sql,
				params: params
			});
		}
		return cb(err, results);
	});
}

function addToTournamentUsersTable (db, opts, cb) {
	const sql = `
		INSERT INTO tournament_users
			(tournament_uuid, user_uuid, coins)
		VALUES
			($1, $2, $3),
			($4, $5, $6)
	`;
	const params = [opts.uuid, opts.user.uuid, opts.startCoins, opts.uuid, opts.opponent.uuid, opts.startCoins];

	db.query(sql, params, (err, results) => {
		if (err) {
			log.error(err, {
				sql: sql,
				params: params
			});
		}
		cb(err, results);
	});
}

function addToTournamentCharactersTable (db, opts, cb) {
	// this query needs to be constructed based on the characters passed in
	let values = [];
	let params = [];

	opts.user.characters.forEach((cUuid, i) => {
		values.push(`($${4 * i + 1}, $${4 * i + 2}, $${4 * i + 3}, $${4 * i + 4})`)
		params.push(opts.uuid, opts.user.uuid, cUuid, 7);
	});

	const user1Vals = params.length;

	opts.opponent.characters.forEach((cUuid, i) => {
		values.push(`($${4 * i + 1 + user1Vals}, $${4 * i + 2 + user1Vals}, $${4 * i + 3 + user1Vals}, $${4 * i + 4 + user1Vals})`);
		params.push(opts.uuid, opts.opponent.uuid, cUuid, 7);
	});

	const sql = `
		INSERT INTO tournament_characters
			(tournament_uuid, user_uuid, character_uuid, value)
		VALUES ${values.join(', ')}
	`;

	db.query(sql, params, (err, results) => {
		// log the error but handle it in the calling func
		if (err) {
			log.error(err, {
				sql: sql,
				params: params
			});
		}
		cb(err, results);
	});
}

function upsertToUserCharacters (db, opts, cb) {
	let values = [];
	let params = [];

	// compose values for the first player
	opts.user.userCharactersToAdd.forEach((c, i) => {
		values.push(`($${2 * i + 1}, $${2 * i + 2})`);
		params.push(opts.user.uuid, c);
	});

	const whereToStartNext = params.length;

	// compose values for the second player
	opts.opponent.userCharactersToAdd.forEach((c, i) => {
		values.push(`($${2 * i + 1 + whereToStartNext}, $${2 * i + 2 + whereToStartNext})`);
		params.push(opts.opponent.uuid, c);
	});

	const sql = `
		WITH data(user_uuid, character_uuid) AS (
			VALUES
				${values.join(', ')}
		)
		INSERT INTO user_characters
			(user_uuid, character_uuid)
		SELECT
			d.user_uuid, d.character_uuid
		FROM
			data d
		WHERE NOT EXISTS (
			SELECT 1
			FROM
				user_characters u
			WHERE
				u.user_uuid = d.user_uuid
				AND
				u.character_uuid = d.character_uuid
		)
	`;

	db.query(sql, params, (err, results) => {
		if (err) {
			log.error(err, {
				sql: sql,
				params: params
			});
		}
		cb(err, results);
	});
}

function rollback (db, err, cb) {
	db.query('ROLLBACK', () => {
		cb(err);
	});
}
