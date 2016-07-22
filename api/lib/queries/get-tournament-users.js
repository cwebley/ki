import log from '../../logger';

// if this doesn't error, results always returns an array of 2 users
export default function getTournamentUsersQuery (db, tournamentUuid, cb) {
	const sql = `
		SELECT
			tu.wins, tu.losses, tu.streak, tu.coins, tu.seeded, tu.drafting, tu.best_streak AS "bestStreak", tu.score, u.name, u.slug,
			u.tournament_streak AS "tournamentStreak", u.tournament_best_streak AS "tournamentBestStreak",
			u.uuid, u.streak AS "globalStreak", u.best_streak AS "globalBestStreak"
		FROM tournament_users AS tu
		JOIN users AS u ON (u.uuid = tu.user_uuid)
		WHERE tu.tournament_uuid = $1
	`;
	const params = [tournamentUuid];

	db.query(sql, params, (err, results) => {
		if (err) {
			log.error(err, {
				sql: sql,
				params: params
			});
			return cb(err)
		}
		if (results.rows.length !== 2) {
			err = new Error('getTournamentUsersQuery did not find 2 results');
			log.error(err, {
				sql: sql,
				params: params,
				tournamentUuid: tournamentUuid
			});
			return cb(err);
		}
		return cb(null, results.rows);
	});
}
