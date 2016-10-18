import log from '../../logger';

export default function getDraftQuery (db, tournamentUuid, userUuids, cb) {
	let draftData = {
		characters: {
			ids: {},
			result: []
		}
	};

	getDraftCharactersForUserQuery(db, tournamentUuid, userUuids[0], (err, leftUserResults) => {
		if (err) {
			return cb(err);
		}
		leftUserResults.forEach(c => {
			draftData.characters.ids[c.uuid] = {
				uuid: c.uuid,
				name: c.name,
				season: c.season,
				slug: c.slug,
				users: {
					[userUuids[0]]: {
						globalWins: parseInt(c.globalWins, 10), // psql SUM function retruns this value as a string
						globalLosses: parseInt(c.globalLosses, 10), // psql SUM function retruns this value as a string
						streak: c.streak,
						value: c.value,
						bestStreak: c.bestStreak,
						fireWins: c.fireWins,
						globalStreak: c.globalStreak,
						globalBestStreak: c.globalBestStreak
					}
				}
			};
		});

		getDraftCharactersForUserQuery(db, tournamentUuid, userUuids[1], (err, rightUserResults) => {
			if (err) {
				return cb(err);
			}
			rightUserResults.forEach(c => {
				draftData.characters.ids[c.uuid].users[userUuids[1]] = {
					globalWins: parseInt(c.globalWins, 10), // psql SUM function retruns this value as a string
					globalLosses: parseInt(c.globalLosses, 10), // psql SUM function retruns this value as a string
					streak: c.streak,
					value: c.value,
					bestStreak: c.bestStreak,
					fireWins: c.fireWins,
					globalStreak: c.globalStreak,
					globalBestStreak: c.globalBestStreak
				};

				// order results based on the seed values that right user has specified for left user
				draftData.characters.result.push(c.uuid);
			});

			getPreviousPick(db, tournamentUuid, (err, previous) => {
				if (err) {
					return cb(err);
				}
				if (previous) {
					draftData.previous = previous;
				}
				return cb(null, draftData);
			});
		});
	});
}

const getPreviousPick = (db, tournamentUuid, cb) => {
	const sql = `
		SELECT
			d.user_uuid, d.character_uuid, d.pick,
			s.value
		FROM drafts d
		JOIN seeds s ON s.character_uuid = d.character_uuid
			AND s.opponent_uuid = d.user_uuid
			AND s.tournament_uuid = d.tournament_uuid
		WHERE d.tournament_uuid = $1
		AND s.user_uuid != d.user_uuid
		ORDER BY d.pick DESC
		LIMIT 1
	`;
	const params = [tournamentUuid];

	db.query(sql, params, (err, results) => {
		if (err) {
			log.error(err, { sql, params });
			return cb(err);
		}
		if (!results.rows || !results.rows.length) {
			return cb();
		}
		return cb(null, {
			userUuid: results.rows[0].user_uuid,
			pick: results.rows[0].pick,
			characterUuid: results.rows[0].character_uuid,
			value: results.rows[0].value
		});
	});
};

const getDraftCharactersForUserQuery = (db, tournamentUuid, userUuid, cb) => {
	const sql = `
		SELECT
			dc.character_uuid AS "uuid",
			c.name, c.season, c.slug,
			s.value,
			uc.streak AS "globalStreak", uc.best_streak AS "globalBestStreak",
			(SELECT SUM(wins) AS "globalWins" FROM tournament_characters WHERE user_uuid = uc.user_uuid AND character_uuid = c.uuid),
			(SELECT SUM(losses) AS "globalLosses" FROM tournament_characters WHERE user_uuid = uc.user_uuid AND character_uuid = c.uuid)
		FROM draft_characters AS dc
			JOIN characters AS c
				ON c.uuid = dc.character_uuid
			LEFT JOIN user_characters AS uc
				ON uc.character_uuid = dc.character_uuid
			LEFT JOIN seeds AS s
				ON s.character_uuid = dc.character_uuid
				AND s.tournament_uuid = dc.tournament_uuid
				AND s.opponent_uuid = uc.user_uuid
		WHERE dc.tournament_uuid = $1
			AND uc.user_uuid = $2
			ORDER BY s.value
	`;
	const params = [tournamentUuid, userUuid];
	db.query(sql, params, (err, results) => {
		if (err) {
			log.error(err, { sql, params });
			return cb(err);
		}
		return cb(null, results.rows);
	});
};
