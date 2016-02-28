export default function getCharactersQuery (db, cb) {
	const sql = `
		SELECT *
		FROM characters
	`;
	const params = [];
	db.query(sql, params, (err, results) => {
		if (err) {
			return cb(err);
		}
		return cb(null, results.rows);
	});
}
