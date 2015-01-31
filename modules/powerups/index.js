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

		var calls = {}
		calls.players = function(done){tourneyMdl.getPlayersNamesIds(opts.tourneyName,done)}
		calls.tourneyId = function(done){tourneyMdl.getTourneyId(opts.tourneyName,done)}

		async.parallel(calls,function(err,results){	
			if(err) return cb(err)
			if(!results.tourneyId.length) return cb(new Error('modules/powerups/index.js:tournament-not-found'))

			var pids = _.pluck(results.players,'id')
			var tid = results.tourneyId[0].id
		
			if(!upcoming.check(tid,pids)) upcoming.create(tid,pids)
			next = upcoming.getNext(tid,results.players,inspectCount)
			return cb(err,inspectDto(next))
		});
	});
};

module.exports = PowerInterface;