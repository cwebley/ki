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
	powerSvc.checkOrClaimInspect(opts,function(err,inspectCount,tid){
		if(err) return cb(err)
		if(!inspectCount || !tid) return cb()

		tourneyMdl.getPlayersNamesIds(opts.tourneyName,function(err,userArr){	
			if(err) return cb(err)

			var uids = _.pluck(userArr,'id')
		
			if(!upcoming.check(tid,uids)) upcoming.create(tid,uids)
			next = upcoming.getNext(tid,userArr,inspectCount)
			return cb(err,inspectDto(next))
		});
	});
};

module.exports = PowerInterface;