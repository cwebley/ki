// returns a user object if successful
export default function createTournamentQuery (db, uuid, name, slug, goal, cb) {
	const sql = `
					INSERT INTO tournaments
						(uuid, name, slug, goal)
					VALUES
						($1, $2, $3, $4)
				`;
	const params = [uuid, name, slug, goal];

	db.query(sql, params, (err, results) => {
		return cb(err, { uuid, name, slug, goal });
	});
}
