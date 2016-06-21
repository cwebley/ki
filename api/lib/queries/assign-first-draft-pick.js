import log from '../../logger';

export default function assignFirstDraftPick (db, tournamentUuid, userUuid, cb) {
	const sql = `
		UPDATE tournament_users
			SET drafting = $1
			WHERE tournament_uuid = $2
			AND user_uuid = $3
	`;
	const params = [true, tournamentUuid, userUuid];

	db.query(sql, params, (err, results) => {
		if (err) {
			log.error(err, { tournamentUuid, userUuid });
		}
		return cb(err, results);
	});
}
