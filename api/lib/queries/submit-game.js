import log from '../../logger';
import async from 'neo-async';
import snake from 'lodash.snakecase';

export default function submitGameQuery (db, tournamentUuid, diff, cb) {
	const tournamentsFields = ['championUuid'];
	const tournamentUsersFields = ['score', 'wins', 'losses', 'streak', 'bestStreak', 'coins'];
	const tournamentCharactersFields = ['value', 'wins', 'losses', 'streak', 'bestStreak', 'fireWins'];
	const usersFields = ['globalStreak', 'globalBestStreak'];
	const userCharactersFields = ['globalStreak', 'globalBestStreak'];

	let tournamentsMap = new Map();
	let tournamentUsersMap = new Map();
	let tournamentCharactersMap = new Map();
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

	// begin transaction
	db.query('BEGIN', () => {

		updateTable(db, 'tournaments', tournamentsMap, (err, results) => {
			if (err) {
				return rollback(db, err, cb);
			}
			updateTable(db, 'tournament_users', tournamentUsersMap, (err, results) => {
				if (err) {
					return rollback(db, err, cb);
				}
				updateTable(db, 'users', usersMap, (err, results) => {
					if (err) {
						return rollback(db, err, cb);
					}
					updateTable(db, 'tournament_characters', tournamentCharactersMap, (err, results) => {
						if (err) {
							return rollback(db, err, cb);
						}
						updateTable(db, 'user_characters', userCharactersMap, (err, results) => {
							if (err) {
								return rollback(db, err, cb);
							}

							// end transaction
							db.query('COMMIT', cb);
						});
					});
				});
			});
		});
	});
}

function translateKey (key) {
	const translations = {
		globalStreak: 'streak',
		globalBestStreak: 'best_streak'
	};
	if (translations[key]) {
		return translations[key];
	}
	// convert camelCase to snake_case for postgres
	return snake(key);
}

function updateTable (db, tableName, updateMap, cb) {
	if (!updateMap.size) {
		log.debug(`No updates for ${tableName}`);
		return cb();
	}
	let updates = [];
	updateMap.forEach((v, k) => {
		let params = [];
		let sets = [];
		let wheres = [];
		Object.keys(v).forEach(field => {
			sets.push(`${translateKey(field)} = $${params.length + 1}`);
			params.push(v[field]);
		});
		Object.keys(k).forEach(field => {
			wheres.push(`${translateKey(field)} = $${params.length + 1}`);
			params.push(k[field]);
		});
		const sql = `
			UPDATE
				${tableName}
			SET
				${sets.join(', ')} WHERE ${wheres.join(' AND ')}
		`
		updates.push(done => {
			db.query(sql, params, (err, results) => {
				if (err) {
					log.error(err, { sql, params });
				}
				done(err, results);
			});
		});
	});
	async.parallel(updates, cb);
}

function rollback (db, err, cb) {
	db.query('ROLLBACK', () => {
		cb(err);
	});
}
