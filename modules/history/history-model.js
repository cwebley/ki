mysql = require('../persistence').mysql;

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

module.exports = HistoryModel;