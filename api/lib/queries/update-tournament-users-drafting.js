import log from '../../logger';

export default function updateTournamentUsersDrafting (db, opts, cb) {
	const sql = `
		UPDATE tournament_users AS tu
		SET drafting = d.drafting::boolean
		FROM (
			VALUES
				($1, $2),
				($3, $4)
		) AS d (user_uuid, drafting)
		WHERE d.user_uuid = tu.user_uuid
	`;
	const params = [opts.user1Uuid, opts.user1Drafting, opts.user2Uuid, opts.user2Drafting];

	db.query(sql, params, (err, result) => {
		if (err) {
			log.error(err, { sql, params });
		}
		return cb(err, result);
	});
}
