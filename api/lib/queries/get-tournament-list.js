import log from '../../logger';

// returns a single tournament object or nothing at all
export default function getTournamentQuery (db, field, value, cb) {
	const sql = `
		SELECT
			t.uuid, t.name, t.slug, t.goal, t.active, t.champion_uuid AS "championUuid", t.time,
				t.characters_per_user AS "charactersPerUser", t.max_starting_value AS "maxStartingValue",
			tu.score,
			u.uuid AS "userUuid", u.name AS "username", u.slug AS "userSlug"
		FROM tournaments t
		JOIN tournament_users tu ON t.uuid = tu.tournament_uuid
		JOIN users u ON tu.user_uuid = u.uuid
		ORDER BY t.time DESC
	`;

	db.query(sql, [], (err, results) => {
		if (err) {
			log.error(err, {
				sql: sql
			});
			return cb(err);
		}
		if (!results.rows.length) {
			return cb(null, null);
		}

		// assemble the data with the users nested
		const formattedData = [];
		let formattedPartial = {};

		results.rows.forEach((item, index) => {
			// each tournament is in this data twice, so only collect the touranment data for every other
			if (index % 2 === 0) {
				formattedPartial = {
					uuid: item.uuid,
					name: item.name,
					slug: item.slug,
					goal: item.goal,
					charactersPerUser: item.charactersPerUser,
					maxStartingValue: item.maxStartingValue,
					time: item.time,
					active: item.active,
					championUuid: item.championUuid,
					users: {
						ids: {
							[item.userUuid]: {
								uuid: item.userUuid,
								name: item.username,
								slug: item.userSlug,
								score: item.score
							}
						},
						result: [item.userUuid]
					}
				}
			} else {
				formattedPartial.users.ids[item.userUuid] = {
					uuid: item.userUuid,
					name: item.username,
					slug: item.userSlug,
					score: item.score
				};
				formattedPartial.users.result.push(item.userUuid);

				// once both users are nested, the data is ready to be pushed
				formattedData.push(formattedPartial);
			}
		});

		return cb(null, formattedData);
	});
}
