import log from '../../logger';

export default function decrementCoins (db, tournamentUuid, userUuid, cost, cb) {
	const sql = `
		UPDATE tournament_users
			SET coins = coins - ${cost}
			WHERE tournament_uuid = $1
			AND user_uuid = $2
	`;
	const params = [tournamentUuid, userUuid];

	db.query(sql, params, (err, result) => {
		if (err) {
			log.error(err, { sql, params });
			return cb(err);
		}
		return cb(null, result);
	});
}
