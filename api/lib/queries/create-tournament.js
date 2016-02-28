import log from '../../logger';

// returns a tournament object if successful
export default function createTournamentQuery (db, opts, cb) {
	// begin transaction
	db.query('BEGIN', () => {

		const tournamentsSql = `
			INSERT INTO tournaments
				(uuid, name, slug, goal)
			VALUES
				($1, $2, $3, $4)
		`;
		const tournamentsParams = [opts.uuid, opts.name, opts.slug, opts.goal];

		db.query(tournamentsSql, tournamentsParams, (err, results) => {
			if (err) {
				log.error(err, {
					sql: tournamentsSql,
					params: tournamentsParams
				});
				return rollback(db, err, cb);
			}

			const tournamentUsersSql = `
				INSERT INTO tournamentUsers
					(tournamentUuid, userUuid)
				VALUES
					($1, $2),
					($3, $4)
			`;
			const tournamentUsersParams = [opts.uuid, opts.user.uuid, opts.uuid, opts.opponent.uuid];

			db.query(tournamentUsersSql, tournamentUsersParams, (err, results) => {
				if (err) {
					log.error(err, {
						sql: tournamentUsersSql,
						params: tournamentUsersParams
					});
					return rollback(db, err, cb);
				}

				// this query needs to be constructed based on the characters passed in
				let tournamentCharactersSql = `
					INSERT INTO tournamentCharacters
						(tournamentUuid, userUuid, characterUuid)
					VALUES
				`;
				let tournamentCharactersParams = [];

				opts.user.characters.forEach((c, i) => {
					tournamentCharactersSql += `($${3*i+1}, $${3*i+2}, $${3*i+3}),\n`;
					tournamentCharactersParams.push(opts.uuid, opts.user.uuid, c.uuid);
				});
				const userCharLength = tournamentCharactersParams.length
				opts.opponent.characters.forEach((c, i) => {
					tournamentCharactersSql += `($${3 * i + 1 + userCharLength}, $${3 * i + 2 + userCharLength}, $${3 * i + 3 + userCharLength}),\n`;
					tournamentCharactersParams.push(opts.uuid, opts.opponent.uuid, c.uuid);
				});

				// trim off the extra new line and extra comma at the end
				tournamentCharactersSql = tournamentCharactersSql.slice(0, -2);

				db.query(tournamentCharactersSql, tournamentCharactersParams, (err, results) => {
					console.log("CHARS RES: ", err, results)
					log.error(err, {
						sql: tournamentCharactersSql,
						params: tournamentCharactersParams
					});
					if (err) {
						return rollback(db, err, cb);
					}

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
}

function rollback (db, err, cb) {
	db.query('ROLLBACK', () => {
		cb(err);
	});
}
