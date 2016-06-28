import log from '../../logger';

export default function selectMostRecentGameQuery (db, tournamentUuid, cb) {
	const sql = `
		SELECT
			g.uuid,
			g.value,
			g.winning_player_uuid,
			g.winning_character_uuid,
			g.winning_player_previous_streak,
			g.winning_character_previous_streak,
			g.losing_player_uuid,
			g.losing_character_uuid,
			g.losing_player_previous_streak,
			g.losing_character_previous_streak,
			g.supreme,
			rg.user_uuid AS "rematched",
			rg.success AS "rematchSuccess"
		FROM
			games g
		LEFT JOIN rematch_games rg ON g.uuid = rg.game_uuid
		WHERE
			g.tournament_uuid = $1
		ORDER BY g.time DESC
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
		return cb(null, {
			uuid: results.rows[0].uuid,
			winner: {
				uuid: results.rows[0].winning_player_uuid,
				characterUuid: results.rows[0].winning_character_uuid,
				value: results.rows[0].value,
				streak: results.rows[0].winning_player_previous_streak,
				characterStreak: results.rows[0].winning_character_previous_streak,
				globalStreak: results.rows[0].winning_player_previous_global_streak,
				characterGlobalStreak: results.rows[0].winning_character_previous_global_streak,
			},
			loser: {
				uuid: results.rows[0].losing_player_uuid,
				characterUuid: results.rows[0].losing_character_uuid,
				streak: results.rows[0].losing_player_previous_streak,
				characterStreak: results.rows[0].losing_character_previous_streak,
				globalStreak: results.rows[0].losing_player_previous_global_streak,
				characterGlobalStreak: results.rows[0].losing_character_previous_global_streak,
			},
			supreme: results.rows[0].supreme,
			rematched: results.rows[0].rematched,
			rematchSuccess: results.rows[0].rematchSuccess
		});
	});
}
