var _ = require('lodash'),
	async = require('async'),
	constants = require('../constants'),
	upcoming = require('../upcoming'),
	powerMdl = require('./powerups-model');

var PowerupSvc = {};

PowerupSvc.checkOrClaimInspect = function(opts,cb) {
	powerMdl.setnxInspectStatus(opts.tourneyName,opts.username,function(err,success){
		if(err) return cb(err)
		if(!success) {

			//check if owner is you
			powerMdl.getInspectStatus(opts.tourneyName,opts.username,function(err,owner){
				if(err) return cb(err)
				if(owner !== opts.username) {
					return cb() // not you
				}
				powerMdl.getUserInspect(opts.tourneyName,opts.username,function(err,results){
					return cb(err,results)
				}) // you
			});
		} else {

			powerMdl.setUserInspect(opts.tourneyName,opts.username,function(err,success){
				if(err) return cb(err)
				if(!success) return cb()
				return cb(null,constants._INSPECT_COUNT)
			});
		}
	});
};

module.exports = PowerupSvc;