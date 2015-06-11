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
		if(err) return cb(err);
		if(!inspectCount || !tid) return cb();

		tourneyMdl.getPlayersNamesIds(opts.tourneySlug,function(err,players){	
			if(err) return cb(err);

			var uids = _.pluck(players,'id');
		
			if(!upcoming.check(tid,uids)) {
				upcoming.create(tid,uids);
			}
			next = upcoming.getNext(tid,players,inspectCount);
			return cb(err,inspectDto(next));
		});
	});
};

PowerInterface.postInspect = function(opts,cb) {

	tourneyMdl.getTourneyId(opts.tourneySlug,function(err, tid){
		if(err) return cb(err);
		if(!tid) return cb();

		tourneyMdl.getPlayersNamesIds(opts.tourneySlug,function(err,players){	
			if(err) return cb(err);
	
			//shallow verify matchups and players
			players.forEach(function(p){
				if(!opts.matchups[p.name] || !opts.matchups[p.name].length){
					//matchup data not present or invalid
					return cb():
				}
				p.matchups = opts.matchups[p.name];
			});
			if(players[0].matchups.length !== players[1].matchups.length){
				//matchups submitted must be equal in number for each player
				return cb();
			}
			var uids = _.pluck(players,'id');
			
			// make sure upcoming data exists
			if(!upcoming.check(tid,uids)) {
				upcoming.create(tid,uids);
			}
			var inspectCount = players[0].matchups.length;
	
			//getNextArray preserves the player ordering
			next = upcoming.getNextArray(tid,players,inspectCount);
	
			//deep verify matchups
			players.forEach(function(p,pIndex){
				p.matchups.forEach(function(m){
					var validatedIndex;
					// for each submitted match, verify it exists in the next data, then remove that value
					validatedIndex = next[pIndex].indexOf(m);
					if(validatedIndex === -1){
						// submitted character not found in next data
						return cb();
					}
					// remove found character from the next data
					next[pIndex].splice(validatedIndex,1);
				});
			});

			if(!upcoming.submitCustom(tid,uids,[players[0].matchups,players[1].matchups])){
				return cb(new Error('failed-to-submit-new-custom-matchups'));
			}
			console.log("DONE IT?!");
			return cb();
		});
	});
};

module.exports = PowerInterface;


// 	if(requester){
// 		for(var i=0; i<dto.users.length; i++){
// 			if(dto.users[i].name === requester){
// 				// pop off and append to front
// 				dto.users.unshift(dto.users.splice(i,1)[0])
// 				break;
// 			}
// 		}
// 	}
