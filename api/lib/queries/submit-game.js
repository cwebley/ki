import log from '../../logger';
import async from 'neo-async';
import snake from 'lodash.snakecase';
import getTournamentCharacterUuidsByStreak from './get-tournament-character-uuids-by-streak';

export default function submitGameQuery (db, tournamentUuid, game, diff, cb) {
	const tournamentUsersFields = ['score', 'wins', 'losses', 'streak', 'bestStreak', 'coins'];
	const tournamentCharactersFields = ['value', 'rawValue', 'wins', 'losses', 'streak', 'bestStreak', 'fireWins'];
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

	diff.users.result.forEach(userUuid => {
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

	const rematchGamesMap = new Map();
	const rematchGamesWhere = {
		gameUuid: game.uuid
	};
	const rematchGamesUpdates = {
		success: game.rematchSuccess
	};
	rematchGamesMap.set(rematchGamesWhere, rematchGamesUpdates);

	// begin transaction
	db.query('BEGIN', () => {
		insertGame(db, tournamentUuid, game, (err, results) => {
			if (err) {
				return rollback(db, err, cb);
			}
			insertInspectGame(db, game, (err, results) => {
				if (err) {
					return rollback(db, err, cb);
				}
				insertOddsmakerGames(db, game, (err, results) => {
					if (err) {
						return rollback(db, err, cb);
					}
					updateTable(db, 'rematch_games', rematchGamesMap, (err, results) => {
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
											getTournamentCharacterUuidsByStreak(db, tournamentUuid, game.winner.uuid, (err, winningUserCharacterStreaks) => {
												if (err) {
													return rollback(db, err, cb);
												}
												getTournamentCharacterUuidsByStreak(db, tournamentUuid, game.loser.uuid, (err, losingUserCharacterStreaks) => {
													if (err) {
														return rollback(db, err, cb);
													}
													// end transaction
													db.query('COMMIT', (err, result) => {
														if (err) {
															return rollback(db, err, cb);
														}
														// return the updated character streaks
														return cb(null, {
															[game.winner.uuid]: winningUserCharacterStreaks,
															[game.loser.uuid]: losingUserCharacterStreaks
														});
													});
												});
											});
										});
									});
								});
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
		globalStreak: 'streak',
		globalBestStreak: 'best_streak',
		rematchSuccess: 'success'
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

function insertGame (db, tournamentUuid, game, cb) {
	const sql = `
		INSERT INTO
		games
			(
				uuid,
				tournament_uuid,
				winning_player_uuid,
				winning_character_uuid,
				losing_player_uuid,
				losing_character_uuid,
				value,
				losing_character_previous_value,
				winning_player_previous_streak,
				winning_player_previous_global_streak,
				winning_character_previous_streak,
				winning_character_previous_global_streak,
				losing_player_previous_streak,
				losing_player_previous_global_streak,
				losing_character_previous_streak,
				losing_character_previous_global_streak,
				supreme
			)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
	`;
	const params = [
		game.uuid,
		tournamentUuid,
		game.winner.uuid,
		game.winner.characterUuid,
		game.loser.uuid,
		game.loser.characterUuid,
		game.winner.value,
		game.loser.value,
		game.winner.streak,
		game.winner.globalStreak,
		game.winner.characterStreak,
		game.winner.characterGlobalStreak,
		game.loser.streak,
		game.loser.globalStreak,
		game.loser.characterStreak,
		game.loser.characterGlobalStreak,
		game.supreme
	];

	db.query(sql, params, (err, results) => {
		if (err) {
			log.error(err, { sql, params });
		}
		return cb(err, results);
	});
}

function insertInspectGame (db, game, cb) {
	// if game wasn't an inspected one, don't add row to this table
	if (!game.inspectUserUuid) {
		return cb();
	}
	// process of elimination find out who the opponent was
	let opponentUuid;
	if (game.winner.uuid === game.inspectUserUuid) {
		opponentUuid = game.loser.uuid;
	} else {
		opponentUuid = game.winner.uuid;
	}
	const sql = `
		INSERT INTO
			inspect_games
			(game_uuid, user_uuid, opponent_uuid)
		VALUES
			($1, $2, $3)
	`;
	const params = [
		game.uuid,
		game.inspectUserUuid,
		opponentUuid
	];

	db.query(sql, params, (err, results) => {
		if (err) {
			log.error(err, { sql, params });
		}
		return cb(err, results);
	});
}

function insertOddsmakerGames (db, game, cb) {
	// if game wasn't an oddsmaker game, don't add row to this table
	if (!game.oddsmakerUserUuids) {
		return cb();
	}
	// process of elimination find out who the opponent was
	let opponentUuid;
	if (game.winner.uuid === game.oddsmakerUserUuids[0]) {
		opponentUuid = game.loser.uuid;
	} else {
		opponentUuid = game.winner.uuid;
	}
	const sql1 = `
		INSERT INTO
			oddsmaker_games
			(game_uuid, user_uuid, opponent_uuid)
		VALUES
			($1, $2, $3)
	`;
	const params1 = [
		game.uuid,
		game.oddsmakerUserUuids[0],
		opponentUuid
	];

	db.query(sql1, params1, (err, results) => {
		if (err) {
			log.error(err, { sql: sql1, params: params1 });
			return cb(err);
		}

		// if this is the only oddsmaker for this game, we're done here
		if (game.oddsmakerUserUuids.length === 1) {
			return cb(null, results);
		}

		// if both users have oddsmakers in this game, we need to insert one more row
		// process of elimination find out who the opponent was
		let opponentUuid;
		if (game.winner.uuid === game.oddsmakerUserUuids[1]) {
			opponentUuid = game.loser.uuid;
		} else {
			opponentUuid = game.winner.uuid;
		}

		const sql2 = `
			INSERT INTO
				oddsmaker_games
				(game_uuid, user_uuid, opponent_uuid)
			VALUES
				($1, $2, $3)
		`;
		const params2 = [
			game.uuid,
			game.oddsmakerUserUuids[1],
			opponentUuid
		];

		db.query(sql2, params2, (err, results) => {
			if (err) {
				log.error(err, { sql: sql2, params: params2 });
			}
			return cb(err, results);
		});
	});
}

function rollback (db, err, cb) {
	db.query('ROLLBACK', () => {
		cb(err);
	});
}
