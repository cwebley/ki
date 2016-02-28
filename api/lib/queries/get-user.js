export default function getUserQuery (db, field, value, cb) {
	const sql = `
		SELECT *
		FROM users
		WHERE ${field} = $1
	`;
	const params = [value];
	db.query(sql, params, (err, results) => {
		if (err) {
			return cb(err);
		}
		if (!results.rows.length) {
			return cb(null, null);
		}
		return cb(null, results.rows[0]);
	});
}
