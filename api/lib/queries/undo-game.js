import log from '../../logger';
import async from 'neo-async';
import snake from 'lodash.snakecase';
import get from 'lodash.get';

export default function undoGameQuery (db, opts, diff, cb) {
	const tournamentUsersFields = ['score', 'wins', 'losses', 'streak', 'coins'];
	const tournamentCharactersFields = ['value', 'rawValue', 'wins', 'losses', 'streak', 'fireWins'];
	const usersFields = ['globalStreak'];
	const userCharactersFields = ['globalStreak'];

	let tournamentsMap = new Map();
	let tournamentUsersMap = new Map();
	let tournamentCharactersMap = new Map();
	let usersMap = new Map();
	let userCharactersMap = new Map();

	const tournamentsWhere = {
		uuid: opts.tournamentUuid
	};
	let tournamentsUpdates = {};
	if (get(diff, '_remove.championUuid')) {
		// set the champion_uuid to the null value
		tournamentsUpdates.championUuid = null;
	}
	diff.users.result.forEach(userUuid => {
		const tournamentUsersWhere = {
			tournamentUuid: opts.tournamentUuid,
			userUuid: userUuid
		};
		let tournamentUsersUpdates = {};

		const usersWhere = {
			uuid: userUuid
		};
		let usersUpdates = {};

		// all keys on each user object
		Object.keys(diff.users.ids[userUuid]).forEach(userKey => {
			if (tournamentUsersFields.indexOf(userKey) !== -1) {
				tournamentUsersUpdates[userKey] = diff.users.ids[userUuid][userKey];
				return;
			}

			if (usersFields.indexOf(userKey) !== -1) {
				usersUpdates[userKey] = diff.users.ids[userUuid][userKey];
				return;
			}

			if (userKey === 'characters') {
				// iterate over character
				diff.users.ids[userUuid].characters.result.forEach(cUuid => {
					const tournamentCharactersWhere = {
						tournamentUuid: opts.tournamentUuid,
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
					Object.keys(diff.users.ids[userUuid].characters.ids[cUuid]).forEach(charKey => {
						if (tournamentCharactersFields.indexOf(charKey) !== -1) {
							tournamentCharactersUpdates[charKey] = diff.users.ids[userUuid].characters.ids[cUuid][charKey];
							return;
						}

						if (userCharactersFields.indexOf(charKey) !== -1) {
							userCharactersUpdates[charKey] = diff.users.ids[userUuid].characters.ids[cUuid][charKey];
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
		deleteGame(db, opts.gameUuid, opts.rematch, (err, results) => {
			if (err) {
				return rollback(db, err, cb);
			}
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
	});
}

function translateKey (key) {
	const translations = {
		globalStreak: 'streak'
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
		`;
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

function deleteGame (db, gameUuid, rematch, cb) {
	if (rematch) {
		return cb();
	}

	const params = [
		gameUuid
	];

	const inspectSql = `
		DELETE FROM
			inspect_games
		WHERE game_uuid = $1
	`;

	const oddsmakerSql = `
		DELETE FROM
			oddsmaker_games
		WHERE game_uuid = $1
	`;

	const gamesSql = `
		DELETE FROM
			games
		WHERE uuid = $1
	`;

	db.query(inspectSql, params, (err, results) => {
		if (err) {
			log.error(err, { inspectSql, params });
		}

		db.query(oddsmakerSql, params, (err, results) => {
			if (err) {
				log.error(err, { oddsmakerSql, params });
			}

			db.query(gamesSql, params, (err, results) => {
				if (err) {
					log.error(err, { gamesSql, params });
				}
				return cb(err, results);
			});
		});
	});
}

function rollback (db, err, cb) {
	db.query('ROLLBACK', () => {
		cb(err);
	});
}
