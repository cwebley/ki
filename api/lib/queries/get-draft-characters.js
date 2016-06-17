import log from '../../logger';

export default function getDraftCharactersQuery (db, tournamentUuid, userUuids, cb) {
	let draftCharacterData = {};
	getDraftCharactersForUserQuery(db, tournamentUuid, userUuids[0], (err, results) => {
		if (err) {
			return cb(err);
		}
		results.forEach(c => {
			draftCharacterData[c.uuid] = {
				uuid: c.uuid,
				name: c.name,
				season: c.season,
				slug: c.slug,
				users: {
					[userUuids[0]]: {
						wins: c.wins,
						losses: c.losses,
						streak: c.streak,
						bestStreak: c.bestStreak,
						value: c.value,
						fireWins: c.fireWins,
						globalStreak: c.globalStreak,
						globalBestStreak: c.globalBestStreak
					}
				}
			}
		});
		console.log("1DC: ", draftCharacterData)

		getDraftCharactersForUserQuery(db, tournamentUuid, userUuids[1], (err, results) => {
			if (err) {
				return cb(err);
			}
			results.forEach(c => {
				draftCharacterData[c.uuid].users[userUuids[1]] = {
					wins: c.wins,
					losses: c.losses,
					streak: c.streak,
					bestStreak: c.bestStreak,
					value: c.value,
					fireWins: c.fireWins,
					globalStreak: c.globalStreak,
					globalBestStreak: c.globalBestStreak
				}
			});
			return cb(null, draftCharacterData);
		});
	});
}

const getDraftCharactersForUserQuery = (db, tournamentUuid, userUuid, cb) => {
	const sql = `
		SELECT
			dc.character_uuid AS "uuid",
			c.name, c.season, c.slug,
			tc.wins, tc.losses, tc.streak, tc.best_streak AS "bestStreak", tc.value, tc.fire_wins AS "fireWins",
			uc.streak AS "globalStreak", uc.best_streak AS "globalBestStreak"
		FROM draft_characters AS dc
			JOIN characters AS c
				ON c.uuid = dc.character_uuid
			LEFT JOIN tournament_characters AS tc
				ON tc.character_uuid = dc.character_uuid
			LEFT JOIN user_characters AS uc
				ON uc.character_uuid = dc.character_uuid
		WHERE dc.tournament_uuid = $1
			AND uc.user_uuid = $2
	`;
	const params = [tournamentUuid, userUuid];
	db.query(sql, params, (err, results) => {

		if (err) {
			log.error(err, {
				sql: sql,
				params: params
			});
			return cb(err)
		}
		return cb(null, results.rows);
	});
}
