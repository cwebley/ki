import log from '../../logger';

export default function getTournamentCharacterUuidsByStreak(db, tUuid, uUuid, cb) {
	const sql = `
		SELECT character_uuid AS "uuid" from tournament_characters
		WHERE tournament_uuid = $1
			AND user_uuid = $2
		ORDER BY streak DESC
	`;
	const params = [tUuid, uUuid];

	db.query(sql, params, (err, result) => {
		if (err) {
			log.error(err, { sql, params });
			return cb(err);
		}
		return cb(null, result.rows.map(r => r.uuid));
	});
}
