var _ = require('lodash'),
	async = require('async'),
	upcoming = require('../upcoming'),
	powerSvc = require('./powerups-service'),
	powerMdl = require('./powerups-model'),
	tourneyMdl = require('../tournaments/tournaments-model');

var PowerInterface = {};

var inspectDto = function(data){
	return {inspect: data}
}

PowerInterface.getInspect = function(opts,cb) {
	powerSvc.checkOrClaimInspect(opts,function(err,inspectCount){
		if(err) return cb(err)
		if(!inspectCount) return cb()

		tourneyMdl.getPlayerNames(opts.tourneyName,function(err,playerNames){	
			if(err) return cb(err)
			if(!upcoming.check(opts.tourneyName,playerNames)) upcoming.create(opts.tourneyName,playerNames)
			next = upcoming.getNext(opts.tourneyName,inspectCount)
			return cb(err,inspectDto(next))
		});
	});
};

module.exports = PowerInterface;