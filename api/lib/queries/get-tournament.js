import log from '../../logger';

// returns a single tournament object or nothing at all
export default function getTournamentQuery (db, field, value, cb) {
	const sql = `
		SELECT uuid, name, slug, goal, champion_uuid AS "championUuid", time
		, characters_per_user AS "charactersPerUser", max_starting_value AS "maxStartingValue"
		FROM tournaments
		WHERE ${field} = $1
	`;
	const params = [value];

	db.query(sql, params, (err, results) => {
		if (err) {
			log.error(err, {
				sql: sql,
				params: params
			});
			return cb(err);
		}
		if (!results.rows.length) {
			return cb(null, null);
		}
		return cb(null, results.rows[0]);
	});
};
