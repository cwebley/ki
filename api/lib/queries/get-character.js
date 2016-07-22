export default function getCharacterQuery (db, field, value, cb) {
	const sql = `
		SELECT uuid, name, slug, season
		FROM characters
		WHERE ${field} = $1
	`;
	const params = [value];
	db.query(sql, params, (err, results) => {
		if (err) {
			return cb(err);
		}
		return cb(null, results.rows && results.rows[0]);
	});
}
