import log from '../../logger';

// returns a single tournament object or nothing at all
export default function getTournamentQuery (db, field, value, cb) {
	const sql = `
		SELECT
			t.uuid, t.name, t.slug, t.goal, t.active, t.champion_uuid AS "championUuid", t.time,
				t.characters_per_user AS "charactersPerUser", t.max_starting_value AS "maxStartingValue",
			tu.score,
			u.name, u.slug
		FROM tournaments t
		JOIN tournament_users tu ON t.uuid = tu.tournament_uuid
		JOIN users u ON tu.user_uuid = u.uuid
	`;

	db.query(sql, [], (err, results) => {
		console.log("TLIST: ", JSON.stringify(results, null, 4));
		if (err) {
			log.error(err, {
				sql: sql
			});
			return cb(err);
		}
		if (!results.rows.length) {
			return cb(null, null);
		}
		return cb(null, results.rows);
	});
}
