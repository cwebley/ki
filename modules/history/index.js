var	historyMdl = require('./history-model'),
	tourneyMdl = require('../tournaments/tournaments-model'),
	upcoming = require('../upcoming'),
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
							console.log("THE GAME EVENT")
							reverseHistoryOps.push(
								// gets its info from the games table since it needs to remove that entry anyway
								function(done){ historyMdl.revertLastGame(tid,done) }
							);
							break;
						case 'fire':
							console.log("FIRE HISTORY EVENT")
							reverseHistoryOps.push(
								function(done){ historyMdl.undoFire(tid,item.userId,item.characterId,done) }
							);
							break;
						case 'ice':
							console.log("ICE HISTORY EVENT")
							reverseHistoryOps.push(
								function(done){ historyMdl.undoIce(tid,item.userId,item.characterId,done) }
							);
							break;

					}
				}.bind(this));

				async.series(reverseHistoryOps,function(err,results){
					console.log("ASYNC RES: ", err, results)

					// TODO delete the history exiting

					historyMdl.deleteHistoryFrom(tid, lastGameIds[1], function(err,deleteHistoryFromRes){
						console.log("DELETE FROM HISTORY RES: ", err, deleteHistoryFromRes)
						if(err) return cb(err);

						upcoming.rematch(tid);
						return cb(null, deleteHistoryFromRes);
					});
				}.bind(this));
			});
		});
	});
}

module.exports = HistoryInterface;
