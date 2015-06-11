var _ = require('lodash'),
	async = require('async'),
	constants = require('../constants'),
	upcoming = require('../upcoming'),
	powerMdl = require('./powerups-model'),
	tourneyMdl = require('../tournaments/tournaments-model');

var PowerupSvc = {};

PowerupSvc.checkOrClaimInspect = function(opts,cb) {

	tourneyMdl.getTourneyId(opts.tourneyName,function(err,tid){	
		if(err) return cb(err)

		powerMdl.setnxInspectStatus(tid,opts.userId,function(err,success){
			if(err) return cb(err)
			if(!success) {
	
				//check if owner is you
				powerMdl.getInspectStatus(tid,opts.userId,function(err,owner){
					if(err) return cb(err)
					if(owner !== opts.userId.toString()) {
						return cb() // not you
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
					return cb(null,constants._INSPECT_COUNT,tid)
				});
			}
		});
	});
};

PowerupSvc.postInspect = function(opts,cb) {
	tourneyMdl.getTourneyId(opts.tourneyName,function(err,tid){	
		if(err) return cb(err)
};

module.exports = PowerupSvc;