// returns a tournament object if successful
export default function createTournamentQuery (db, uuid, name, slug, goal, userUuid, opponentUuid, cb) {
	// begin transaction
	db.query('BEGIN', () => {

		const tournamentsSql = `
			INSERT INTO tournaments
				(uuid, name, slug, goal)
			VALUES
				($1, $2, $3, $4)
		`;
		const tournamentsParams = [uuid, name, slug, goal];

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
			const tournamentUsersParams = [uuid, userUuid, uuid, opponentUuid];

			db.query(tournamentUsersSql, tournamentUsersParams, (err, results) => {
				if (err) {
					return rollback(db, err, cb);
				}
				db.query('COMMIT', () => {
					// return the tournament object
					return cb(null, { uuid, name, slug, goal });
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
