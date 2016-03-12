import log from '../../logger';

export default function selectMostRecentGameQuery (db, tournamentUuid, cb) {
	const sql = `
		SELECT
			winning_player_uuid, winning_character_uuid, losing_player_uuid, losing_character_uuid, value, losing_player_previous_streak, losing_character_previous_streak, supreme
		FROM
			games
		WHERE
			tournament_uuid = $1
		ORDER BY time DESC
		LIMIT 1
	`;
	const params = [tournamentUuid];

	db.query(sql, params, (err, results) => {
		if (err) {
			log.error(err, {sql, params});
			return cb(err);
		}
		if (!results.rows.length) {
			return cb();
		}
		// return a game object
		console.log(" GAME REZ: ", JSON.stringify(results, null, 4))
		return cb({
			winner: {
				uuid: results.rows[0].winning_player_uuid,
				characterUuid: results.rows[0].winning_character_uuid,
				value: results.rows[0].value
			},
			loser: {
				uuid: results.rows[0].losing_player_uuid,
				characterUuid: results.rows[0].losing_character_uuid,
				streak: results.rows[0].losing_player_previous_streak,
				characterStreak: results.rows[0].losing_character_previous_streak
			},
			supreme: results.rows[0].supreme
		});
	});
}
