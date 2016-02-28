// returns a user object if successful
export default function registerUserQuery (db, uuid, name, slug, email, hash, cb) {
	const sql = `
					INSERT INTO users
						(uuid, name, slug, email, password)
					VALUES
						($1, $2, $3, $4, $5)
				`;
	const params = [uuid, name, slug, email, hash];

	db.query(sql, params, (err, results) => {
		return cb(err, { uuid, name, slug });
	});
}
