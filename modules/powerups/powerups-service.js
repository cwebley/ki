var _ = require('lodash'),
	async = require('async'),
	constants = require('../constants'),
	upcoming = require('../upcoming'),
	powerMdl = require('./powerups-model'),
	userMdl = require('../users/users-model'),
	historyMdl = require('../history/history-model'),
	tourneyMdl = require('../tournaments/tournaments-model');

var PowerupSvc = {};

PowerupSvc.checkOrClaimInspect = function(opts,cb) {
	tourneyMdl.getTourneyId(opts.tourneySlug,function(err,tid){	
		if(err) return cb(err);
		if(!tid) return cb();

		// check if inspect is currently in use
		powerMdl.setnxInspectStatus(tid,opts.userId,function(err,success){
			if(err) return cb(err);
			if(success){
				return PowerupSvc.initiateInspect(tid,opts.userId,cb);
			}
			//inspect already in progress
			//check if owner is you
			powerMdl.getInspectStatus(tid,function(err,owner){
				if(err) return cb(err);
				// you own it. return the remaining count.
				if(owner === opts.userId.toString()) {
					return powerMdl.getUserInspect(tid,opts.userId,function(err,remaining){
						return cb(err,remaining,tid);
					});
				}
				// you don't own it.
				// check how many inspects are left. if 0, you can still claim the power.
				powerMdl.getUserInspect(tid,owner,function(err,remaining){
					if(err) return cb(err);
					if(remaining > 0){ 
						// nah, nice try.
						return cb();
					}
					powerMdl.setInspectStatus(tid,opts.userId,function(err,results){
						if(err) return cb(err);
						return PowerupSvc.initiateInspect(tid,opts.userId,cb);
					});
				});
			});
		});
	});
};

// inspect was successfully claimed. start the count, record the history.
PowerupSvc.initiateInspect = function(tid,userId,cb){
	powerMdl.decrUserStock(tid,userId,function(err,stock){
		if(err) return cb(err);
		if(stock < 0){
			// you locked inspect but didn't actually have the power stock to do so. 
			// bump power back up to 0, and unlock inspect for next guy. this edgecase will be prevented on FE.
			return powerMdl.incrUserStock(tid,userId,function(err,stock){
				if(err) return cb(err);
				powerMdl.clearInspectStatus(tid,cb);
			});
		}

		powerMdl.setUserInspect(tid,opts.userId,function(err,success){
			if(err) return cb(err);
			if(!success) return cb();

			//inspect just went through. record the history. value = current stock, delta = change in stock (-1)	
			historyMdl.recordEvent({
				tid: tid,
				uid: opts.userId,
				value: stock,
				delta: -1,
				eventString: 'power-inspect'
			},function(err,historyRes){
				return cb(null,constants._INSPECT_COUNT,tid);
			});
		});
	});
};

PowerupSvc.decrInspection = function(tid,cb) {
	powerMdl.getInspectStatus(tid,function(err,owner){
		if(err) return cb(err);
		powerMdl.decrUserInspect(tid,owner,function(err,remaining){
			// keep around if it's 0, owner can't re-inspect until next game, but opponent can jump in.
			if(remaining > -1){
				return cb(null,remaining);
			}

			// reset and unlock relevant keys
			powerMdl.clearInspectStatus(tid,function(err,success){
				if(err) return cb(err);
				return cb(null,success);
			});
		});
	});
};

PowerupSvc.incrInspect = function(tid,cb) {
	powerMdl.getInspectStatus(tid,function(err,inspectOwner){
		if(err) return cb(err);
		if(!inspectOwner) return cb();

		powerMdl.incrUserInspect(tid,inspectOwner,function(err,stock){
			if(err) return cb(err);
			return cb(null, stock);
		});
	});
};

PowerupSvc.getInspectStatus = function(tid,cb) {
	powerMdl.getInspectStatus(tid,function(err,inspectOwner){
		if(err) return cb(err);
		if(!inspectOwner) return cb();

		powerMdl.getUserInspect(tid,inspectOwner,function(err,stock){
			if(err) return cb(err);
			userMdl.getUserById(inspectOwner,function(err,userObj){
				if(err) return cb(err);
				return cb(null, userObj.name, parseInt(stock,10));
			});
		});
	});
};

PowerupSvc.getPowerStocks = function(tid, uids, cb){
	var calls = uids.map(function(u){
		return function(done){
			powerMdl.getUserStock(tid,u,done);
		}
	}.bind(this));

	async.series(calls,function(err,results){
		if(err) return cb(err);
		return cb(null, results)
	});
};

module.exports = PowerupSvc;