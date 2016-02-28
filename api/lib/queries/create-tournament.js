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
		const tournamentsParams = [opts.tournamentUuid, opts.tournamentName, opts.tournamentSlug, opts.tournamentGoal];

		db.query(tournamentsSql, tournamentsParams, (err, results) => {
			if (err) {
				return rollback(db, err, cb);
			}

			const tournamentUsersSql = `
				INSERT INTO tournamentUsers
					(tournamentUuid, userUuid)
				VALUES
					($1, $2),
					($3, $4)
			`;
			const tournamentUsersParams = [opts.tournamentUuid, opts.userUuid, opts.tournamentUuid, opts.opponentUuid];

			db.query(tournamentUsersSql, tournamentUsersParams, (err, results) => {
				if (err) {
					return rollback(db, err, cb);
				}

				db.query('COMMIT', () => {
					// return the tournament object
					return cb(null, {
						uuid: opts.tournamentUuid,
						name: opts.tournamentName,
						slug: opts.tournamentSlug,
						goal: opts.tournamentGoal
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
