var _ = require('lodash'),
	async = require('async'),
	constants = require('../constants'),
	upcoming = require('../upcoming'),
	powerMdl = require('./powerups-model'),
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
				return PowerupSvc.initiateInspect(tid,opts.userId);
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
						return PowerupSvc.initiateInspect(tid,opts.userId);
					});
				});
			});
		});
	});
};

// inspect was successfully claimed. start the count, record the history.
PowerupSvc.initiateInspect = function(tid,userId){
	powerMdl.setUserInspect(tid,opts.userId,function(err,success){
		if(err) return cb(err);
		if(!success) return cb();

		//inspect just went through. record the history.	
		historyMdl.useInspect(tid,opts.userId,function(err,historyRes){
			return cb(null,constants._INSPECT_COUNT,tid);
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

module.exports = PowerupSvc;