import { query } from '../../persistence/pg';

// returns a user object if successful
export default function registerUserQuery (uuid, name, slug, email, hash, cb) {
	const sql = `
					INSERT INTO users
						(uuid, name, slug, email, password)
					VALUES
						($1, $2, $3, $4, $5)
				`;
	const params = [uuid, name, slug, email, hash];

	query(sql, params, (err, results) => {
		return cb(err, { uuid, name, slug });
	});
}
