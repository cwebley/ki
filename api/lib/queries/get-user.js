import { query } from '../../persistence/pg';

export default function getUserQuery (field, value, cb) {
	const sql = `
					SELECT *
					FROM users
					WHERE ${field} = $1
				`;
	const params = [value];
	query(sql, params, (err, results) => {
		if (err) {
			return cb(err);
		}
		if (!results.rows.length) {
			return cb(null, null);
		}
		return cb(null, results.rows[0]);
	});
}
