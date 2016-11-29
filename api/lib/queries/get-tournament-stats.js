import log from '../../logger';

export default function getTournamentStatsQuery (db, tournamentSlug, cb) {
	const sql = `
		SELECT
			u1.uuid AS "winningUserUuid",
			u1.name AS "winningUsername",
			u1.slug AS "winningUserSlug",
			u2.uuid AS "losingUserUuid",
			u2.name AS "losingUsername",
			u2.slug AS "losingUserSlug",
			c1.uuid AS "losingCharacterUuid",
			c1.name AS "losingCharacterName",
			c1.slug AS "losingCharacterSlug",
			c2.uuid AS "winningCharacterUuid",
			c2.name AS "winningCharacterName",
			c2.slug AS "winningCharacterSlug",
			g.uuid AS "gameUuid",
			g.value,
			g.supreme,
			g.winning_player_previous_streak AS "winningPlayerPreviousStreak",
			g.winning_character_previous_streak AS "winningCharacterPreviousStreak",
			g.losing_player_previous_streak AS "losingPlayerPreviousStreak",
			g.losing_character_previous_streak AS "losingCharacterPreviousStreak",
			g.losing_character_previous_value AS "losingCharacterPreviousValue",
			rg.game_uuid AS "rematchGameUuid",
			rg.success AS "rematchSuccess"
		FROM tournaments t
			JOIN games g ON t.uuid = g.tournament_uuid
			JOIN users u1 ON u1.uuid = g.winning_player_uuid
			JOIN users u2 ON u2.uuid = g.losing_player_uuid
			JOIN characters c1 ON c1.uuid = g.winning_character_uuid
			JOIN characters c2 ON c2.uuid = g.losing_character_uuid
			LEFT JOIN rematch_games rg ON g.uuid = rg.game_uuid
		WHERE t.slug = $1
		ORDER BY g.time ASC
	`;
	const params = [tournamentSlug];

	db.query(sql, params, (err, results) => {
		if (err) {
			log.error(err, {
				sql,
				params
			});
			return cb(err);
		}
		if (!results.rows.length) {
			return cb(null, null);
		}

		let formattedData = {
			games: {
				ids: {},
				result: []
			},
			users: {
				ids: {},
				result: []
			}
		};

		results.rows.forEach(r => {
			// add the winning user if not yet in the data
			if (!formattedData.users.ids[r.winningUserUuid]) {
				formattedData.users.result.push(r.winningUserUuid);
				formattedData.users.ids[r.winningUserUuid] = {
					uuid: r.winningUserUuid,
					name: r.winningUsername,
					slug: r.winningUserSlug,
					characters: {
						ids: {},
						result: []
					}
				};
			}
			// add the losing user if not yet in data
			if (!formattedData.users.ids[r.losingUserUuid]) {
				formattedData.users.result.push(r.losingUserUuid);
				formattedData.users.ids[r.losingUserUuid] = {
					uuid: r.losingUserUuid,
					name: r.losingUsername,
					slug: r.losingUserSlug,
					characters: {
						ids: {},
						result: []
					}
				};
			}

			// add the winning character if not yet in the data
			if (!formattedData.users.ids[r.winningUserUuid].characters.ids[r.winningCharacterUuid]) {
				formattedData.users.ids[r.winningUserUuid].characters.result.push(r.winningCharacterUuid);
				formattedData.users.ids[r.winningUserUuid].characters.ids[r.winningCharacterUuid] = {
					uuid: r.winningCharacterUuid,
					name: r.winningCharacterName,
					slug: r.winningCharacterSlug,
					games: []
				};
			}
			// add the losing character if not yet in the data
			if (!formattedData.users.ids[r.losingUserUuid].characters.ids[r.losingCharacterUuid]) {
				formattedData.users.ids[r.losingUserUuid].characters.result.push(r.losingCharacterUuid);
				formattedData.users.ids[r.losingUserUuid].characters.ids[r.losingCharacterUuid] = {
					uuid: r.losingCharacterUuid,
					name: r.losingCharacterName,
					slug: r.losingCharacterSlug,
					games: []
				};
			}

			// add the game to the winning character data
			formattedData.users.ids[r.winningUserUuid].characters.ids[r.winningCharacterUuid].games.push(r.gameUuid);
			// add the game to the losing character data
			formattedData.users.ids[r.losingUserUuid].characters.ids[r.losingCharacterUuid].games.push(r.gameUuid);

			// add the game to the games data
			formattedData.games.result.push(r.gameUuid);
			formattedData.games.ids[r.gameUuid] = {
				winningUserUuid: r.winningUserUuid,
				winningCharacterUuid: r.winningCharacterUuid,
				losingUserUuid: r.losingUserUuid,
				losingCharacterUuid: r.losingCharacterUuid,
				supreme: r.supreme,
				value: r.value,
				winningUserPreviousStreak: r.winningPlayerPreviousStreak,
				winningCharacterPreviousStreak: r.winningCharacterPreviousStreak,
				losingUserPreviousStreak: r.losingPlayerPreviousStreak,
				losingCharacterPreviousStreak: r.losingCharacterPreviousStreak,
				losingCharacterPreviousValue: r.losingCharacterPreviousValue,
				rematched: !!r.rematchGameUuid,
				rematchSuccess: !!r.rematchSuccess
			};
		});

		return cb(null, formattedData);
	});
}
