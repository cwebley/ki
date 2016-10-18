import log from '../../logger';

export default function getUserCharactersQuery (db, userUuid, characterUuids, cb) {
	let values = [];
	let params = [userUuid];

	characterUuids.forEach((c, i) => {
		values.push(`$${i + 2}`);
		params.push(c);
	});

	const sql = `
		SELECT user_uuid
		FROM user_characters
		WHERE user_uuid = $1
		AND character_uuid IN (
			${values.join(', ')}
		)
	`;

	db.query(sql, params, (err, results) => {
		if (err) {
			log.error(err, {
				sql: sql,
				params: params
			});
		}
		let onlyUuids = results.rows.map(c => c.uuid);
		return cb(err, onlyUuids);
	});
}
