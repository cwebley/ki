var	historyMdl = require('./history-model'),
	tourneyIndex = require('../tournaments'),
	tourneyMdl = require('../tournaments/tournaments-model'),
	powerups = require('../powerups'),
	powerMdl = require('../powerups/powerups-model'),
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

HistoryInterface.undoLastGame = function(slug, requester, cb) {
	tourneyMdl.getTourneyId(slug,function(err,tid){
		if(err) return cb(err);
		if(!tid) return cb();

		// get most recent game
		historyMdl.getLastGameId(tid, function(err,lastGameIds){
			if(err) return cb(err);
			if(lastGameIds.length !== 2){
				return cb(new Error('last-game-not-found'));
			}

			historyMdl.getAllHistorySinceId(tid, lastGameIds[0],function(err,historyData){
				if(err) return cb(err);

				var reverseHistoryOps = [];
				historyData.forEach(function(item){
					switch (item.description) {
						case 'game':
							reverseHistoryOps.push(
								// gets its info from the games table since it needs to remove that entry anyway
								function(done){ historyMdl.revertLastGame(tid,done) }
							);
							break;
						case 'fire':
							reverseHistoryOps.push(
								function(done){ historyMdl.undoFire(tid,item.userId,item.characterId,done) }
							);
							break;
						case 'ice':
							reverseHistoryOps.push(
								function(done){ historyMdl.undoIce(tid,item.userId,item.characterId,done) }
							);
							break;
						case 'power-stock-incr':
							reverseHistoryOps.push(
								function(done){ powerMdl.decrUserStock(tid,item.userId,done) }
							);

					}
				}.bind(this));

				async.series(reverseHistoryOps,function(err,results){
					historyMdl.deleteHistoryFrom(tid, lastGameIds[1], function(err,deleteHistoryFromRes){
						if(err) return cb(err);

						powerups.incrInspect(tid,function(err,incrInspectRes){
							if(err) return cb(err);
							upcoming.undo(tid);
							return tourneyIndex.getAllTourneyStats(slug,requester,cb); // return stats so user doesn't have to refresh
						});
					});
				}.bind(this));
			});
		});
	});
}

module.exports = HistoryInterface;
