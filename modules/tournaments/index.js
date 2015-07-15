var _ = require('lodash'),
	async = require('async'),
	upcoming = require('../upcoming'),
	tourneySvc = require('./tournaments-service'),
	tourneyMdl = require('./tournaments-model'),
	powerSvc = require('../powerups/powerups-service'),
	powerMdl = require('../powerups/powerups-model');

var TourneyInterface = {};

TourneyInterface.allStatsDto = function(o){
	var dto = {
		users: [], 
		seeded: o.seeded, 
		inspect: {
			owner: o.inspectOwner,
			stock: o.inspectStock
		},
		rematch: o.rematch
	};

	for (var i=0;i<o.data.length;i++){
		o.data[i].powerStock = o.powerStocks[i];
		dto.users.push(o.data[i]);
	}

	//	order users so the client doesn't have to
	if(o.requester){
		for(var i=0; i<dto.users.length; i++){
			if(dto.users[i].name === o.requester){
				// pop off and append to front
				dto.users.unshift(dto.users.splice(i,1)[0])
				break;
			}
		}
	}
	return dto;
};

// data: array of user-data objects
TourneyInterface.listDto = function(data){
	return {tournaments: data}
};

TourneyInterface.newTournament = function(options, cb) {
	tourneySvc.newTournament(options, function(err, tid){
		return cb(err, tid)
	});
};

TourneyInterface.editTournament = function(options, cb) {
	tourneySvc.editTournament(options, function(err, results){
		return cb(err,results)
	});
};

TourneyInterface.getTourneyList = function(cb) {
	tourneySvc.getTourneyList(function(err,results){
		if(err) return cb(err)
		return cb(null,TourneyInterface.listDto(results))
	});
};

TourneyInterface.getTourneyInfo = function(tourneySlug,cb) {
	tourneyMdl.getTourneyInfo(tourneySlug,function(err,results){
		if(err) return cb(err)
		return cb(null,results)
	});
};

TourneyInterface.deleteTournament = function(tourneySlug,cb) {
	tourneyMdl.getTourneyId(tourneySlug,function(err,tid){
		if(err) return cb(err);

		tourneyMdl.deleteTournament(tid,function(err,results){
			if(err) return cb(err)
			return cb(null,results)
		});
	});
};

TourneyInterface.getAllTourneyStats = function(tourneySlug,requester,cb) {
	// verify tourney name valid
	tourneyMdl.getTourneyId(tourneySlug,function(err,tourneyId,seeded){
		if(err) return cb(err)
		if(!tourneyId) return cb()

		// get user stats
		tourneySvc.getUsersLevelStats(tourneySlug, function(err,tournamentData){
			if(err)return cb(err)

			tourneyMdl.getPlayersNamesIds(tourneySlug,function(err,players){
				if(err) return cb(err)
				var uids = _.pluck(players,'id')

				// get next matchup, populate if necessary (ie: server was restarted and memory wiped)
				if(!upcoming.check(tourneyId,uids)){
					upcoming.create(tourneyId,uids)
				}

				var next = upcoming.getNextArray(tourneyId,players,1);
				var prev = upcoming.lastMatchup(tourneyId,players);

				// add next data for each user
				for(var i=0;i<tournamentData.length;i++){
					tournamentData[i].next = next[i];
					if(prev){
						tournamentData[i].prev = prev[i];
					}
				}


				// get stats for each character
				var calls = [];
				var characterDataGetter = function(tourneySlug,userName){
					return function(done){tourneySvc.getCharacterLevelStats(tourneySlug,userName,done)}
				}
				for(var i=0;i<tournamentData.length;i++){
					calls.push(characterDataGetter(tourneySlug,tournamentData[i].name))
				}
				async.parallel(calls,function(err,charData){
					if(err) return cb(err)
					for(var i=0;i<tournamentData.length;i++){
						tournamentData[i].characters = charData[i]
					}
					powerSvc.getInspectStatus(tourneyId,function(err,inspectOwner,inspectStock){
						if(err) return cb(err);
						
						powerMdl.getRematchStatus(tourneyId,function(err,rematchStatus){
							if(err) return cb(err);

							powerSvc.getPowerStocks(tourneyId,uids,function(err,powerStocks){
								if(err) return cb(err);
								if(powerStocks.length !== tournamentData.length){
									return cb();
								}
								var dtoOpts = {
									data: tournamentData,
									seeded: seeded,
									inspectOwner: inspectOwner,
									inspectStock: inspectStock,
									requester: requester,
									powerStocks: powerStocks,
									rematch: !!rematchStatus
								}
								return cb(err,TourneyInterface.allStatsDto(dtoOpts));
							});
						});
					});
				});
			});
		});
	});
};

TourneyInterface.updateSeedStatus = function(tourneySlug,cb) {
	tourneyMdl.updateSeedStatus(tourneySlug,function(err,results){
		if(err) return cb(err);
		return cb(null,results);
	});
};

module.exports = TourneyInterface;
