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
			if(err) return cb(err)
			if(!success) {
	
				//check if owner is you
				powerMdl.getInspectStatus(tid,function(err,owner){
					if(err) return cb(err)
					if(owner !== opts.userId.toString()) {
						return cb(); // not you
					}
					// you
					powerMdl.getUserInspect(tid,opts.userId,function(err,results){
						return cb(err,results,tid)
					})
				});
			} else {
	
				powerMdl.setUserInspect(tid,opts.userId,function(err,success){
					if(err) return cb(err)
					if(!success) return cb()

					//inspect just went through. record the history.	
					historyMdl.useInspect(tid,opts.userId,function(err,historyRes){
						return cb(null,constants._INSPECT_COUNT,tid)
					});
				});
			}
		});
	});
};

PowerupSvc.decrInspection = function(tid,cb) {
	powerMdl.getInspectStatus(tid,function(err,owner){
		if(err) return cb(err);
		powerMdl.decrUserInspect(tid,owner,function(err,remaining){
			if(remaining > 0){
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