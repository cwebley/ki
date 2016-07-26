import log from '../../logger';

export default function editTournamentQuery (db, opts, cb) {
	const sql = `
		UPDATE tournaments
		SET goal = $1, champion_uuid = $2
		WHERE uuid = $3
	`;
	const params = [opts.goal, null, opts.tournamentUuid];
	db.query(sql, params, (err, results) => {
		if (err) {
			log.error(err, { sql, params });
			return rollback(db, err, cb);
		}
		return cb(null, results);
	});
}
