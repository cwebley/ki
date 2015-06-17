var	historyMdl = require('./history-model'),
	tourneyMdl = require('../tournaments/tournaments-model'),
	async = require('async'),
	_ = require("lodash");

var HistoryInterface = {};

/*
	Not in use anywhere yet		
*/
HistoryInterface.recalculateHistory = function(tid, cb){
	// get seed data
	historyMdl.recalculateSeedsFromHistory(tid,function(err,historyData){
		if(err) return cb(err);
		// update values in tournamentCharacters

	});
}

HistoryInterface.undoLastGame = function(slug, cb) {
	tourneyMdl.getTourneyId(slug,function(err,tid){
		if(err) return cb(err);
		if(!tid) return cb();

		// get most recent game
		historyMdl.getLastGameId(tid, function(err,lastGameIds){
			if(err) return cb(err);
			if(lastGameIds.length !== 2){
				return cb(new Error('last-game-not-found'));
			}
			console.log("LAST GAME IDS: ", lastGameIds)

			historyMdl.getAllHistorySinceId(tid, lastGameIds[0],function(err,historyData){
				console.log("GET ALL HISTORY SINCE: ", err, historyData)
				if(err) return cb(err);
				// return cb(null, historyData);

				var reverseHistoryOps = [];
				historyData.forEach(function(item){
					switch (item.description) {
						case 'game':
							reverseHistoryOps.push(
								// gets its info from the games table since it needs to remove that entry anyway
								function(done){ historyMdl.revertLastGame(tid,done) }
							);
							break;
					}
				}.bind(this));

				async.series(reverseHistoryOps,function(err,results){
					console.log("ASYNC RES: ", err, results)
					if(err) return cb(err);
					return cb(null, results);
				});
			});
		});
	});
}

module.exports = HistoryInterface;
