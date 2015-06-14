var _ = require('lodash'),
	async = require('async'),
	upcoming = require('../upcoming'),
	powerSvc = require('./powerups-service'),
	powerMdl = require('./powerups-model'),
	tourneyMdl = require('../tournaments/tournaments-model');

var PowerInterface = {};

var inspectDto = function(next,players,requester){

	//make sure me/them are in the correct places
	if(players[0].name !== requester){
		//reverse these guys
		players.unshift(players.splice(1,2)[0]);
		next.unshift(next.splice(1,2)[0]);
	}

	return {
		me: next[0],
		them: next[1]
	};
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
			next = upcoming.getNextArray(tid,players,inspectCount);
			return cb(err,inspectDto(next,players,opts.username));
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
					return cb();
				}
				p.matchups = opts.matchups[p.name];
			}.bind(this));
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
			Math.min(inspectCount, 20);
	
			//getNextArray preserves the player ordering
			var next = upcoming.getNextArray(tid,players,inspectCount);

			//deep verify matchups
			players.forEach(function(p,pIndex){
				if(!next){
					return;
				}
				p.matchups.forEach(function(m){
					var validatedIndex;
					// for each submitted match, verify it exists in the next data, then remove that value
					validatedIndex = next[pIndex].indexOf(m);
					if(validatedIndex === -1){
						// submitted character not found in next data
						return;
					}
					// remove found character from the next data
					next[pIndex].splice(validatedIndex,1);
				}.bind(this));

				if(next[pIndex].length){
					// not empty, submitted characters were invalid
					// reset next to indicate failure to the parent func
					next = null;
					return;
				}
			}.bind(this));

			// empty next means deep verify failed, exit 400
			if(!next){
				return cb();
			}

			if(!upcoming.submitCustom(tid,uids,[players[0].matchups,players[1].matchups])){
				return cb(new Error('failed-to-submit-new-custom-matchups'));
			}
			return cb(null, true);
		});
	});
};

module.exports = PowerInterface;
