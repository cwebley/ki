var	historyMdl = require('./history-model'),
	tourneyIndex = require('../tournaments'),
	tourneyMdl = require('../tournaments/tournaments-model'),
	powerSvc = require('../powerups/powerups-service'),
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

HistoryInterface.undoLastGame = function(tid,slug,requester,undoHard,cb) {
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
							function(done){ historyMdl.revertLastGame(tid,undoHard,done) }
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
						break;
					case 'streak-points-incr':
						reverseHistoryOps.push(
							function(done){ powerMdl.decrStreakPoints(tid,item.userId,item.delta,done) }
						);

				}
			}.bind(this));

			async.series(reverseHistoryOps,function(err,results){
				if(err) return cb(err);

				if(undoHard){
					return HistoryInterface.undoCleanup(tid, lastGameIds[1], slug, requester, cb);
				}
				return HistoryInterface.rematchCleanup(tid, lastGameIds, slug, requester, cb);
			}.bind(this));
		});
	});
}

HistoryInterface.rematchCleanup = function(tid, gameIds, slug, requester, cb){
	historyMdl.updateHistoryForRematch(tid, gameIds, function(err,updateHistoryRes){
		if(err) return cb(err);

		powerSvc.incrInspect(tid,function(err,incrInspectRes){
			if(err) return cb(err);

			upcoming.rematch(tid);
			return tourneyIndex.getAllTourneyStats(slug,requester,cb); // return stats so user doesn't have to refresh
		});
	});
}

HistoryInterface.undoCleanup = function(tid, gameId, slug, requester, cb){
	historyMdl.deleteHistoryFrom(tid, gameId, function(err,deleteHistoryFromRes){
		if(err) return cb(err);

		powerSvc.incrInspect(tid,function(err,incrInspectRes){
			if(err) return cb(err);

			upcoming.undo(tid);
			return tourneyIndex.getAllTourneyStats(slug,requester,cb); // return stats so user doesn't have to refresh
		});
	});
}

module.exports = HistoryInterface;
