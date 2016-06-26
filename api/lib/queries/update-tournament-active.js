import log from '../../logger';

export default function updateTournamentActive (db, activeStatus, tournamentUuid, cb) {
	const sql = `
		UPDATE tournaments
			SET active = $1
			WHERE uuid = $2
	`;
	const params = [activeStatus, tournamentUuid];

	db.query(sql, params, (err, result) => {
		if (err) {
			log.error(err, { sql, params });
			return cb(err);
		}
		return cb(null, result);
	});
}
