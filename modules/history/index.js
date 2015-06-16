var	historyMdl = require('./history-model'),
	tourneyMdl = require('../tournaments/tournaments-model');

var History = {};

/*
	Not in use anywhere yet		
*/
History.recalculateHistory = function(tid, cb){
	// get seed data
	historyMdl.recalculateSeedsFromHistory(tid,function(err,historyData){
		if(err) return cb(err);
		// update values in tournamentCharacters

	});
}

History.undoLastGame = function(slug, cb) {
	tourneyMdl.getTourneyId(slug,function(err,tid){
		if(err) return cb(err);
		if(!tid) return cb();

		// get most recent game
		historyMdl.getLastGameId(tid,function(err,lastGameIds){
			if(err) return cb(err);
			if(lastGameIds.length !== 2){
				return cb(new Error('last-game-not-found'));
			}

			historyMdl.getAllHistorySinceId(tid, lastGameIds[1],function(err,historyData){
				console.log("GET ALL HISTORY SINCE: ", err, historyData)
				if(err) return cb(err);
				return cb(null, historyData);
			});
		});
	});
}

module.exports = History;
