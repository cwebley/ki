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

	mysql.query('rw', sql, params, 'modules/history/history-model/getLastGmaeId-events', function(err, eventsRes){

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

HistoryModel.revertLastGame = function(tid,cb) {
	console.log("REVERT GAME!")
	var sql = 'SELECT * from games WHERE tournamentId = ? ORDER BY time DESC LIMIT 1',
		params = [tid];

	mysql.query('rw', sql, params, 'modules/history/history-model/revertLastGame-select-games', function(err, gameRes){
		if(err) return cb(err);
		// return cb(null, gameRes);

		// decr wins from tournamentUsers
		var sql = 'UPDATE tournamentUsers SET wins = wins -1'
				+ ', bestStreak = CASE WHEN bestStreak = curStreak THEN curStreak-1 END'
				+ ', curStreak = curStreak -1'
				+ ', score = score - ?'
				+ ' WHERE tournamentId = ? AND userId = ?',
			params = [tid, gameRes[0].winningPlayerId, gameRes[0].value];

		mysql.query('rw', sql, params, 'modules/history/history-model/revertLastGame-tournamentUsers-winnerdecr', function(err, decrRes){
			console.log("TU DECR: ", err, decrRes)
			if(err) return cb(err);

		// // decr total wins from users table
		// var sql = 'UPDATE users SET wins = wins -1 WHERE id = ?',
		// 	paras = [gameRes[0].winningPlayerId];

		// mysql.query('rw', sql, params, 'modules/history/history-model/revertLastGame-users-winnerdecr', function(err, decrRes){
		// 	if(err) return cb(err);

		// 	// decr total losses from users table
		// 	var sql = 'UPDATE users SET losses = losses -1 WHERE id = ?',
		// 		paras = [gameRes[0].losingPlayerId];

		// 	mysql.query('rw', sql, params, 'modules/history/history-model/revertLastGame-users-loserdecr', function(err, decrRes){
		// 		if(err) return cb(err);

				// // decr total wins from users table
				// var sql = 'UPDATE users SET wins = wins -1 WHERE id = ?',
				// 	paras = [gameRes[0].winningPlayerId];

				// mysql.query('rw', sql, params, 'modules/history/history-model/revertLastGame-users-winnerdecr', function(err, decrRes){
				// 	if(err) return cb(err);
		});
	});
};

module.exports = HistoryModel;