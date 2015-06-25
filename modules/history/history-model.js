var mysql = require('../persistence').mysql,
	_ = require('lodash');
	

var HistoryModel = {};

HistoryModel.recalculateSeedsFromHistory = function(tid,cb) {
	var sql = 'SELECT id FROM events WHERE description = ?',
		params = ['seeding'];

	mysql.query('rw', sql, params, 'modules/tournaments/tournaments-model/recalculateSeedsFromHistory-events', function(err, eventResult){
		if(err) return cb(err);
	
		var sql = 'SELECT * FROM history WHERE tournamentId = ? AND eventId = ? ORDER BY `time`',
			params = [tid, eventResult[0].id];
	
		mysql.query('rw', sql, params, 'modules/tournaments/tournaments-model/recalculateSeedsFromHistory-history', function(err, seedHistory){
			if(err) return cb(err);

			// clear tournamentCharacters
			var sql = 'DELETE FROM tournamentCharacters where tournamentId = ?',
				params = [tid];

			mysql.query('rw', sql, params, 'modules/tournaments/tournaments-model/overrideTournamentCharacters-deleteTournamentCharacters', function(err, results){
				if(err) return cb(err);

				// re-insert each tournamentCharacter with found history data
				var insert = 'INSERT INTO `tournamentCharacters` (tournamentId,userId,characterId,value)',
					values = ' VALUES (?,?,?,?)',
					params = [];

				for(var i=0;i<seedHistory.length;i++){
					if(i < seedHistory.length-1){
						values += ',(?,?,?,?)'
					}
					params.push(tid);
					params.push(seedHistory[i].userId);
					params.push(seedHistory[i].characterId);
					params.push(seedHistory[i].value);
				}
				// in case there is more than 1 seed event for a given tournament+user+character
				var onDup = ' ON DUPLICATE KEY UPDATE value = VALUES(value)';

				mysql.query('rw', insert + values + onDup, params, 'modules/users/users-model/insertOrResetCharVals:tournamentUsers', function(err, results){
					return cb(err,results);
				});
			});
		});
	});
};

HistoryModel.getLastGameId = function(tid,cb) {
	var sql = 'SELECT id FROM events WHERE description = ?',
		params = ['game'];

	mysql.query('rw', sql, params, 'modules/history/history-model/getLastGameId-events', function(err, eventsRes){

		var sql = 'SELECT id FROM history WHERE tournamentId = ? AND eventId = ? ORDER BY id DESC limit 2', // games have 2 entries in history
			params = [tid,eventsRes[0].id];
		mysql.query('rw',sql,params,'modules/history/history-model/getLastGameId',function(err,historyRes){
			if(err) return cb(err);
			return cb(null, _.pluck(historyRes,'id'));
		});
	});
};

HistoryModel.getAllHistorySinceId = function(tid,since,cb) {
	var sql = 'SELECT h.id, h.userId, h.characterId, h.eventId, e.description, h.value, h.delta'
			+ ' FROM history h JOIN events e ON e.id = h.eventId'
			+ ' WHERE h.tournamentId = ? AND h.id >= ? ORDER BY h.id DESC',
		params = [tid,since];

	mysql.query('rw', sql, params, 'modules/history/history-model/getAllHistorySinceId', cb);
};

//ids = array of history.ids
HistoryModel.removeHistoryEvents = function(ids,cb) {
	var sql = 'DELETE FROM history WHERE id in (?';

	for(var i=0; i<ids.length-1; i++){ // length - 1 since 1 `?` already exists
		sql += ',?'
	}
	sql += ')'

	mysql.query('rw', sql, ids, 'modules/history/history-model/removeHistoryEvents', cb);
};

// find previous streaks for both users, the winning-character and the losing-character
HistoryModel.getPreviousStreaks = function(tid,cb) {
	var sql = 'SELECT * from games WHERE tournamentId = ? ORDER BY id DESC',
		params = [tid];

	mysql.query('rw', sql, params, 'modules/history/history-model/getPreviousStreaks-games', function(err,allGames){
		if(err) return cb(err);
		if(!allGames.length) return cb(new Error('getPreviousStreaks-no-games-found-for-tid-'+tid));

		var streaks = {
			winner: 0,
			charWinner: 0,
			loser: 0,
			charLoser: 0
		}

		if(allGames.length < 2){
			// we're undoing the results from the first game. no previous streaks.
			return cb(null,streaks);
		}

		var winningPlayerId = allGames[0].winningPlayerId,
			losingPlayerId = allGames[0].losingPlayerId,
			winningCharId = allGames[0].winningCharacterId,
			losingCharId = allGames[0].losingCharacterId,
			prevWinnerId = allGames[1].winningPlayerId,
			prevLoserId = allGames[1].losingPlayerId;

		// update user streaks wrt last game
		if(winningPlayerId === prevWinnerId){
			streaks.winner++;
			streaks.loser--;
		}
		if(winningPlayerId === prevLoserId){
			streaks.winner--;
			streaks.loser++;
		}

		// calculate the depth of the previous streaks for the winning character
		for(var i=1; i<allGames.length; i++){
			if(allGames[i].winningCharacterId === winningCharId && allGames[i].winningPlayerId === winningPlayerId){
				if(streaks.charWinner < 0){
					// he is on a losing streak. this is the start of it.
					break;
				}
				streaks.charWinner++;
			}
			if(allGames[i].losingCharacterId === winningCharId && allGames[i].losingPlayerId === winningPlayerId){
				if(streaks.charWinner > 0){
					// he is on a winning streak. this was the start of it.
					break;
				}
				streaks.charWinner--;
			}
		}

		// calculate the depth of the previous streaks for the losing character
		for(var i=1; i<allGames.length; i++){
			if(allGames[i].winningCharacterId === losingCharId && allGames[i].winningPlayerId === losingPlayerId){
				if(streaks.charLoser < 0){
					// he is on a losing streak. this is the start of it.
					break;
				}
				streaks.charLoser++;
			}
			if(allGames[i].losingCharacterId === losingCharId && allGames[i].losingPlayerId === losingPlayerId){
				if(streaks.charLoser > 0){
					// he is on a winning streak. this was the start of it.
					break;
				}
				streaks.charLoser--;
			}
		}

		if(allGames.length === 2){
			//no need to dig deeper
			return cb(null,streaks)
		}

		// starting at 2 games back, calculate the depth of the previous streaks for users
		for(var i=2; i<allGames.length; i++){
			if(allGames[i].winningPlayerId !== prevWinnerId){
				break;
			}
			streaks.winner++;
			streaks.loser--;
		}
		return cb(null,streaks);
	});
};

HistoryModel.undoFire = function(tid,uid,cid,cb){
	var sql = 'UPDATE tournamentCharacters SET value = value -1'
			+ ' WHERE tournamentId = ? AND userId = ? AND characterId != ? AND value > 1',
		params = [tid,uid,cid];
	mysql.query('rw', sql, params, 'modules/history/history-model/undoFire-tournamentCharacters', function(err, undoFire){
		if(err) return cb(err);
		
		return cb(null, undoFire);
	});
}

HistoryModel.undoIce = function(tid,uid,cid,cb){
	var sql = 'UPDATE tournamentCharacters SET value = value +1'
			+ ' WHERE tournamentId = ? AND userId = ? AND characterId != ?',
		params = [tid,uid,cid];
	mysql.query('rw', sql, params, 'modules/history/history-model/undoIce-tournamentCharacters', function(err, undoIce){
		if(err) return cb(err);
		
		return cb(null, undoIce);
	});
}

// TODO fish through history or games table to handle streaks (users and characters) are busted here. losers streaks especially :(
HistoryModel.revertLastGame = function(tid,cb) {

	var sql = 'SELECT * from games WHERE tournamentId = ? ORDER BY id DESC LIMIT 1',
		params = [tid];

	mysql.query('rw', sql, params, 'modules/history/history-model/revertLastGame-select-games', function(err, gameRes){
		if(err) return cb(err);
		if(!gameRes.length) return cb();

		HistoryModel.getPreviousStreaks(tid,function(err,streakResults){
			if(err)return cb(err);

			// decr wins from users, tournamentUsers, and handle streaks
			var sql = 'UPDATE tournamentUsers tu, users u'
					+ ' SET tu.wins = tu.wins -1'
					+ ', u.tournamentWins = u.tournamentWins -1'
					+ ', u.globalBestStreak = CASE WHEN u.globalBestStreak = tu.curStreak THEN tu.curStreak-1 END'
					+ ', tu.bestStreak = CASE WHEN tu.bestStreak = tu.curStreak THEN tu.curStreak-1 END'
					+ ', tu.curStreak = ?'
					+ ', tu.score = tu.score - ?'
					+ ' WHERE tu.userId = u.id' // JOIN
					+ ' AND tu.tournamentId = ? AND tu.userId = ?',
				params = [streakResults.winner, gameRes[0].value, tid, gameRes[0].winningPlayerId];

			mysql.query('rw', sql, params, 'modules/history/history-model/revertLastGame-tournamentUsers-winnerdecr', function(err, winnerDecrRes){
				if(err) return cb(err);

				// decr losses from users, tournamentUsers, and handle streaks
				var sql = 'UPDATE tournamentUsers tu, users u'
						+ ' SET tu.losses = tu.losses -1'
						+ ', u.tournamentLosses = u.tournamentLosses -1'
						+ ', tu.curStreak = ?'
						+ ' WHERE tu.userId = u.id' // JOIN
						+ ' AND tu.tournamentId = ? AND tu.userId = ?',
					params = [streakResults.loser, tid, gameRes[0].losingPlayerId];

				mysql.query('rw', sql, params, 'modules/history/history-model/revertLastGame-tournamentUsers-loserdecr', function(err, loserDecrRes){
					if(err) return cb(err);

					// winning character wins streak decr and value incr
					var sql = 'UPDATE tournamentCharacters tc, charactersData cd'
							+ ' SET tc.wins = tc.wins -1'
							+ ', cd.wins = cd.wins -1'
							+ ', cd.globalBestStreak = CASE WHEN cd.globalBestStreak = tc.curStreak THEN tc.curStreak-1 END'
							+ ', tc.bestStreak = CASE WHEN tc.bestStreak = tc.curStreak THEN tc.curStreak-1 END'
							+ ', tc.curStreak = ?'
							+ ', tc.value = ?' // we happen to have this value handy
							+ ' WHERE tc.userId = cd.userId AND tc.characterId = cd.characterId' // JOIN
							+ ' AND tc.tournamentId = ? AND tc.userId = ? AND tc.characterId = ?',
						params = [streakResults.charWinner, gameRes[0].value, tid, gameRes[0].winningPlayerId, gameRes[0].winningCharacterId];

					mysql.query('rw', sql, params, 'modules/history/history-model/revertLastGame-tournamentCharacters-winnerDecr', function(err, winningCharDecrRes){
						if(err) return cb(err);

						// losing character losses decr streak incr and value incr
						var sql = 'UPDATE tournamentCharacters tc, charactersData cd'
								+ ' SET tc.losses = tc.losses -1'
								+ ', cd.losses = cd.losses -1'
								+ ', tc.curStreak = ?'
								+ ', tc.value = tc.value - 1' // losing char went up 1 for false submission
								+ ' WHERE tc.userId = cd.userId AND tc.characterId = cd.characterId' // JOIN
								+ ' AND tc.tournamentId = ? AND tc.userId = ? AND tc.characterId = ?',
							params = [streakResults.charLoser, tid, gameRes[0].losingPlayerId, gameRes[0].losingCharacterId];

						mysql.query('rw', sql, params, 'modules/history/history-model/revertLastGame-tournamentCharacters-loserDecr', function(err, losingCharDecrRes){
							if(err) return cb(err);

							// decr firewins for each of the winning player's characters that were on fire
							var sql = 'UPDATE tournamentCharacters SET fireWins = fireWins -1'
									+ ' WHERE tournamentId = ? AND userId = ? AND curStreak >= 3 AND characterId != ?'
								params = [tid, gameRes[0].winningPlayerId, gameRes[0].winningCharacterId];

							mysql.query('rw', sql, params, 'modules/history/history-model/revertLastGame-decrFireWins', function(err, decrFireWins){
								if(err) return cb(err);

								// delete from games table
								var sql = 'DELETE FROM games WHERE id = ?',
									params = [gameRes[0].id];

								mysql.query('rw', sql, params, 'modules/history/history-model/revertLastGame-games-deleteGame', function(err, deleteGameRes){
									if(err) return cb(err);
									return cb(null,deleteGameRes);
								});
							});
						});
					});
				});
			});
		});
	});
};

HistoryModel.deleteHistoryFrom = function(tid,hid,cb){
	var sql = 'DELETE FROM history WHERE tournamentId = ? AND id >= ?',
		params = [tid,hid];
	mysql.query('rw', sql, params, 'modules/history/history-model/deleteHistoryFrom', function(err, deleteFromHistoryRes){
		if(err) return cb(err);
		
		return cb(null, deleteFromHistoryRes);
	});
}

module.exports = HistoryModel;