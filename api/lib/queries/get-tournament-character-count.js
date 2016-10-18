export default function getTournamentCharacterCount (db, tournamentUuid, userUuid, cb) {
	const sql = `
		SELECT COUNT(1)::integer
		FROM tournament_characters
		WHERE tournament_uuid = $1
			AND user_uuid = $2
	`;
	const params = [tournamentUuid, userUuid];

	db.query(sql, params, (err, result) => {
		if (err) {
			return cb(err);
		}
		return cb(null, result.rows[0].count);
	});
}
