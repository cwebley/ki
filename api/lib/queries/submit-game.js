import log from '../../logger';
import async from 'neo-async';
import snake from 'lodash.snakecase';

export default function submitGameQuery (db, tournamentUuid, diff, cb) {

	const tournamentsFields = ['championUuid'];
	const tournamentUsersFields = ['wins', 'losses', 'streak', 'bestStreak', 'coins'];
	const tournamentCharactersFields = ['value', 'wins', 'losses', 'streak', 'bestStreak', 'fireWins'];
	const usersFields = ['globalStreak', 'globalBestStreak'];
	const userCharactersFields = ['globalStreak', 'globalBestStreak'];

	let tournamentsMap = new Map();
	let tournamentUsersMap = new Map();
	let tournamentCharactersMap = new Map();

	// these ones are a little bit unique since the fields
	// are aggregates and the diff fields don't match exactly
	let usersMap = new Map();
	let userCharactersMap = new Map();

	const tournamentsWhere = {
		uuid: tournamentUuid
	};
	let tournamentsUpdates = {};
	if (diff.championUuid) {
		tournamentsUpdates.championUuid = diff.championUuid;
	}

	Object.keys(diff.users).forEach(userUuid => {
		const tournamentUsersWhere = {
			tournamentUuid: tournamentUuid,
			userUuid: userUuid
		};
		let tournamentUsersUpdates = {};

		const usersWhere = {
			uuid: userUuid
		};
		let usersUpdates = {};

		// all keys on each user object
		Object.keys(diff.users[userUuid]).forEach(userKey => {

			if (tournamentUsersFields.indexOf(userKey) !== -1) {
				tournamentUsersUpdates[userKey] = diff.users[userUuid][userKey];
				return;
			}

			if (usersFields.indexOf(userKey) !== -1) {
				usersUpdates[userKey] = diff.users[userUuid][userKey];
				return;
			}

			if (userKey === 'characters') {
				// iterate over character
				Object.keys(diff.users[userUuid].characters).forEach(cUuid => {
					const tournamentCharactersWhere = {
						tournamentUuid: tournamentUuid,
						userUuid: userUuid,
						characterUuid: cUuid
					};
					let tournamentCharactersUpdates = {};

					const userCharactersWhere = {
						userUuid: userUuid,
						characterUuid: cUuid
					};
					let userCharactersUpdates = {};

					// iterate over each key for the character
					Object.keys(diff.users[userUuid].characters[cUuid]).forEach(charKey => {

						if (tournamentCharactersFields.indexOf(charKey) !== -1) {
							tournamentCharactersUpdates[charKey] = diff.users[userUuid].characters[cUuid][charKey];
							return;
						}

						if (userCharactersFields.indexOf(charKey) !== -1) {
							userCharactersUpdates[charKey] = diff.users[userUuid].characters[cUuid][charKey]
							return;
						}
					});
					if (Object.keys(userCharactersUpdates).length) {
						userCharactersMap.set(userCharactersWhere, userCharactersUpdates);
					}
					if (Object.keys(tournamentCharactersUpdates).length) {
						tournamentCharactersMap.set(tournamentCharactersWhere, tournamentCharactersUpdates);
					}
				});
			}
		});

		if (Object.keys(tournamentsUpdates).length) {
			tournamentsMap.set(tournamentsWhere, tournamentsUpdates);
		}
		if (Object.keys(tournamentUsersUpdates).length) {
			tournamentUsersMap.set(tournamentUsersWhere, tournamentUsersUpdates);
		}
		if (Object.keys(usersUpdates).length) {
			usersMap.set(usersWhere, usersUpdates);
		}
	});

	console.log("MAPS: ")
	console.log("TOURNAMENTS: ")
	tournamentsMap.forEach((v, k) => {
		console.log("K: ", k);
		console.log("V: ", v);
	});
	console.log("TOURNAMENTUSERS:")
	tournamentUsersMap.forEach((v, k) => {
		console.log("K: ", k);
		console.log("V: ", v);
	});
	console.log("USERS:" );
	usersMap.forEach((v, k) => {
		console.log("K: ", k);
		console.log("V: ", v);
	});
	console.log("USERCharacters:" );
	userCharactersMap.forEach((v, k) => {
		console.log("K: ", k);
		console.log("V: ", v);
	});
	console.log("TOURNNAMENT CHARACTERS:" );
	tournamentCharactersMap.forEach((v, k) => {
		console.log("K: ", k);
		console.log("V: ", v);
	});
	// begin transaction
	db.query('BEGIN', () => {

		updateTournaments(db, tournamentsMap, (err, results) => {
			if (err) {
				return rollback(db, err, cb);
			}
			updateTournamentUsers(db, tournamentUsersMap, (err, results) => {
				if (err) {
					return rollback(db, err, cb);
				}
			// 	addToTournamentCharactersTable(db, diff, (err, results) => {
			// 		if (err) {
			// 			return rollback(db, err, cb);
			// 		}
			//
			// 		upsertToUserCharacters(db, diff, (err, results) => {
			// 			if (err) {
			// 				return rollback(db, err, cb);
			// 			}
			//
			// 			// end transaction
			// 			db.query('COMMIT', () => {
			// 				// return the tournament object
			// 				return cb(null, {
			// 					uuid: diff.uuid,
			// 					name: diff.name,
			// 					slug: diff.slug,
			// 					goal: diff.goal
			// 				});
			// 			});
			// 		});
			// 	});
			});
		});
	});
}

// TODO
function updateTournaments (db, tournamentsMap, cb) {
	if (!tournamentsMap.size) {
		log.debug('No updates for tournaments');
		return cb();
	}
	// const sql = `
	// 	UPDATE tournaments
	// 	SET ${}
	// `;
	// const params = [tournamentUuid, diff.championUuid];
	//
	// db.query(sql, params, (err, results) => {
	// 	if (err) {
	// 		log.error(err, {
	// 			sql: sql,
	// 			params: params
	// 		});
	// 	}
	// 	return cb(err, results);
	// });
}

/*
//TODO
update test as t set
    column_a = c.column_a,
    column_c = c.column_c
from (values
    ('123', 1, '---'),
    ('345', 2, '+++')
) as c(column_b, column_a, column_c)
where c.column_b = t.column_b;

update tournament_users as tu set
	score = d.score,
	streak = d.streak
from (values
	('tournamentUuid', 'userUuid', 10, 1),
	('tournamentUuid', 'userUuid', 0, -1)
)	as d(tournament_uuid, user_uuid, score, streak)
where d.tournament_uuid = tu.tournament_uuid AND d.user_uuid = tu.user_uuid

*/
function updateTournamentUsers (db, tournamentUsersMap, cb) {
	if (!tournamentUsersMap.size) {
		log.debug('No updates for tournament_users');
		return cb();
	}
	// console.log("TUKEYS: ", [...tournamentUsersMap.keys().forEach(update => {return Object.keys(update)})])
	// console.log("TU VALUE: ", [...tournamentUsersMap.values()].forEach(update => {return Object.keys(update)}))
	let updates = [];
	tournamentUsersMap.forEach((v, k) => {
		let params = [];
		let sets = [];
		Object.keys(v).forEach((field) => {
			sets.push(`${snake(field)} = $${params.length + 1}`);
			params.push(v[field]);
		});
		let wheres = [];
		Object.keys(k).forEach((field, i) => {
			wheres.push(`${snake(field)} = $${params.length + 1}`);
			params.push(k[field]);
		});
		// let update = `SET ${sets.join(', ')} WHERE ${wheres.join(', ')}`;
		// console.log("UPDATE: ", update);
		const sql = `
			UPDATE
				tournament_users
			SET
				${sets.join(', ')} WHERE ${wheres.join(' AND ')}
		`
		updates.push(done => {
			log.info("ASYNC ATTEMPT: ", {
				sql: sql,
				params: params
			});
			db.query(sql, params, done);
		});
	});

	async.parallel(updates, (err, results) => {
		console.log("ASYNC || DONE: ", err, results);
		if (err) {
			return cb(err);
		}
		return cb(null, results);
	});
	// console.log("PARAMS: ", params);
	//
	// const sql = `
	// 	UPDATE
	// 		tournament_users
	// 	SET
	// 		${updates.join(', ')}
	// `
	// console.log("SQL: ", sql)
	// const params = [diff.uuid, diff.user.uuid, diff.startCoins, diff.uuid, diff.opponent.uuid, diff.startCoins];
	//
	// db.query(sql, params, (err, results) => {
	// 	if (err) {
	// 		log.error(err, {
	// 			sql: sql,
	// 			params: params
	// 		});
	// 	}
	// 	cb(err, results);
	// });
}
//
// function addToTournamentCharactersTable (db, diff, cb) {
// 	// this query needs to be constructed based on the characters passed in
// 	let values = [];
// 	let params = [];
//
// 	diff.user.characters.forEach((c, i) => {
// 		values.push(`($${4 * i + 1}, $${4 * i + 2}, $${4 * i + 3}, $${4 * i + 4})`)
// 		params.push(diff.uuid, diff.user.uuid, c.uuid, 7);
// 	});
//
// 	const user1Vals = params.length;
//
// 	diff.opponent.characters.forEach((c, i) => {
// 		values.push(`($${4 * i + 1 + user1Vals}, $${4 * i + 2 + user1Vals}, $${4 * i + 3 + user1Vals}, $${4 * i + 4 + user1Vals})`);
// 		params.push(diff.uuid, diff.opponent.uuid, c.uuid, 7);
// 	});
//
// 	const sql = `
// 		INSERT INTO tournament_characters
// 			(tournament_uuid, user_uuid, character_uuid, value)
// 		VALUES ${values.join(', ')}
// 	`;
//
// 	db.query(sql, params, (err, results) => {
// 		// log the error but handle it in the calling func
// 		if (err) {
// 			log.error(err, {
// 				sql: sql,
// 				params: params
// 			});
// 		}
// 		cb(err, results);
// 	});
// }
//
// function upsertToUserCharacters (db, diff, cb) {
// 	let values = [];
// 	let params = [];
//
// 	// compose values for the first player
// 	diff.user.userCharactersToAdd.forEach((c, i) => {
// 		values.push(`($${2 * i + 1}, $${2 * i + 2})`);
// 		params.push(diff.user.uuid, c);
// 	});
//
// 	const whereToStartNext = params.length;
//
// 	// compose values for the second player
// 	diff.opponent.userCharactersToAdd.forEach((c, i) => {
// 		values.push(`($${2 * i + 1 + whereToStartNext}, $${2 * i + 2 + whereToStartNext})`);
// 		params.push(diff.opponent.uuid, c);
// 	});
//
// 	const sql = `
// 		WITH data(user_uuid, character_uuid) AS (
// 			VALUES
// 				${values.join(', ')}
// 		)
// 		INSERT INTO user_characters
// 			(user_uuid, character_uuid)
// 		SELECT
// 			d.user_uuid, d.character_uuid
// 		FROM
// 			data d
// 		WHERE NOT EXISTS (
// 			SELECT 1
// 			FROM
// 				user_characters u
// 			WHERE
// 				u.user_uuid = d.user_uuid
// 				AND
// 				u.character_uuid = d.character_uuid
// 		)
// 	`;
//
// 	db.query(sql, params, (err, results) => {
// 		if (err) {
// 			log.error(err, {
// 				sql: sql,
// 				params: params
// 			});
// 		}
// 		cb(err, results);
// 	});
// }

function rollback (db, err, cb) {
	db.query('ROLLBACK', () => {
		cb(err);
	});
}
