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
					addToTournamentCoins(db, opts, (err, results) => {
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
			(tournament_uuid, user_uuid)
		VALUES
			($1, $2),
			($3, $4)
	`;
	const params = [opts.uuid, opts.user.uuid, opts.uuid, opts.opponent.uuid];

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
	let sql = `
		INSERT INTO tournament_characters
			(tournament_uuid, user_uuid, character_uuid, value)
		VALUES
	`;
	let params = [];

	opts.user.characters.forEach((c, i) => {
		sql += `($${4 * i + 1}, $${4 * i + 2}, $${4 * i + 3}, $${4 * i + 4}),\n`;
		params.push(opts.uuid, opts.user.uuid, c.uuid, 7);
	});

	const userCharLength = params.length;

	opts.opponent.characters.forEach((c, i) => {
		sql += `($${4 * i + 1 + userCharLength}, $${4 * i + 2 + userCharLength}, $${4 * i + 3 + userCharLength}, $${4 * i + 4 + userCharLength}),\n`;
		params.push(opts.uuid, opts.opponent.uuid, c.uuid, 7);
	});

	// trim off the extra new line and extra comma at the end
	sql = sql.slice(0, -2);

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

function addToTournamentCoins (db, opts, cb) {
	const sql = `
		INSERT INTO tournament_coins
			(tournament_uuid, user_uuid, stock)
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

function rollback (db, err, cb) {
	db.query('ROLLBACK', () => {
		cb(err);
	});
}
