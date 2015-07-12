var _ = require('lodash'),
	async = require('async'),
	constants = require('../constants'),
	upcoming = require('../upcoming'),
	powerSvc = require('./powerups-service'),
	powerMdl = require('./powerups-model'),
	userMdl = require('../users/users-model'),
	historyMdl = require('../history/history-model'),
	tourneyMdl = require('../tournaments/tournaments-model');

var PowerInterface = {};

var inspectDto = function(next,players,requester){
	//make sure me/them are in the correct places
	if(players[1].name === requester){
		//reverse these guys
		players.push(players.splice(0,1)[0]);
		next.push(next.splice(0,1)[0]);
	}

	return {
		me: next[0],
		them: next[1]
	};
}

PowerInterface.getPowerStocks = function(tid, uids, cb){
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
			next = upcoming.getNextArray(tid,players,inspectCount,true);
			return cb(err,inspectDto(next,players,opts.username));
		});
	});
};

PowerInterface.getInspectStatus = function(tid,cb) {
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

PowerInterface.incrInspect = function(tid,cb) {
	powerMdl.getInspectStatus(tid,function(err,inspectOwner){
		if(err) return cb(err);
		if(!inspectOwner) return cb();

		powerMdl.incrUserInspect(tid,inspectOwner,function(err,stock){
			if(err) return cb(err);
			return cb(null, stock);
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
			Math.min(inspectCount, 19); // 19 because upcoming only keep 20 games in memory and skipCurrent is a thing
	
			//getNextArray preserves the player ordering
			var next = upcoming.getNextArray(tid,players,inspectCount,true);

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
			if(!upcoming.submitCustom(tid,uids,[players[0].matchups,players[1].matchups],true)){
				return cb(new Error('failed-to-submit-new-custom-matchups'));
			}
			return cb(null, true);
		});
	});
};

PowerInterface.decrInspection = function(options, cb){
	return powerSvc.decrInspection(options.tourneyId, cb);
};

PowerInterface.oddsMaker = function(opts,cb) {
	tourneyMdl.getTourneyId(opts.tourneySlug,function(err, tid){
		if(err) return cb(err);
		if(!tid) return cb();

		// verify character
		userMdl.getCharacterId(opts.character,function(err,cid){
			if(err) return cb(err);
			if(!cid) return cb();

			powerMdl.decrUserStock(tid,opts.userId,function(err,stock){
				if(err) return cb(err);
				if(stock < 0){
					// you don't have the power stock to do this. this will be prevented on FE.
					return powerMdl.incrUserStock(tid,opts.userId,cb);
				}

				var next = upcoming.getNextArray(tid,[{id:opts.userId}],constants._ODDS_MAKER_LENGTH, true)[0]; // just yours, ignore opponent
				var resolved = next.map(function(c){
					var equalsZeroMaybe = Math.floor(Math.random()*(constants._ODDS_MAKER_LENGTH/constants._ODDS_MAKER_VALUE))
					return (equalsZeroMaybe === 0) ? opts.character : c
				}.bind(this));

				historyMdl.recordEvent({
					tid: tid,
					uid: opts.userId,
					cid: cid,
					eventString: 'power-oddsMaker',
					value: stock,
					delta: -1
				}, function(err,historyRes){
					if(err) return cb(err);
					if(!historyRes) return cb();

					upcoming.submitCustom(tid,[opts.userId],[resolved], true);
					return cb(null,{powerStock: stock});
				});
			});
		});
	});
};

PowerInterface.incrUserStock = function(tid,uid,cb){
	powerMdl.incrUserStock(tid,uid,function(err,stock){
		if(err) return cb(err);
		// record history
		historyMdl.recordEvent({
			tid: tid,
			uid: uid,
			eventString: 'power-stock-incr',
			value: stock,
			delta: 1
		},cb);
	});
};

module.exports = PowerInterface;
