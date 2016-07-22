import log from '../../logger';

export default function getTournamentCharactersQuery (db, tournamentUuid, userUuid, cb) {
	const sql = `
		SELECT
			c.name, c.season, c.slug, c.uuid,
			tc.wins, tc.losses, tc.streak, tc.best_streak AS "bestStreak",
			tc.value, tc.raw_value AS "rawValue", tc.fire_wins AS "fireWins",
			uc.streak AS "globalStreak", uc.best_streak AS "globalBestStreak",
			d.pick
		FROM characters AS c
			JOIN tournament_characters AS tc
				ON tc.character_uuid = c.uuid
			JOIN user_characters AS uc
				ON uc.user_uuid = tc.user_uuid
				AND uc.character_uuid = c.uuid
			LEFT JOIN drafts d
				ON d.tournament_uuid = tc.tournament_uuid
				AND d.character_uuid = c.uuid
		WHERE tc.tournament_uuid = $1
			AND tc.user_uuid = $2
			ORDER BY tc.streak DESC, d.pick ASC
	`;
	const params = [tournamentUuid, userUuid];

	db.query(sql, params, (err, results) => {
		if (err) {
			log.error(err, {
				sql: sql,
				params: params
			});
			return cb(err);
		}
		return cb(null, results.rows);
	});
}
