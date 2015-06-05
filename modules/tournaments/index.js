var _ = require('lodash'),
	async = require('async'),
	upcoming = require('../upcoming'),
	tourneySvc = require('./tournaments-service'),
	tourneyMdl = require('./tournaments-model');

var TourneyInterface = {};

TourneyInterface.allStatsDto = function(data,seeded,requester){
	var dto = {users:[], seeded:seeded};

	for (var i=0;i<data.length;i++){
		dto.users.push(data[i])
	}
	//	order users so the client doesn't have to
	if(requester){
		for(var i=0; i<dto.users.length; i++){
			if(dto.users[i].name === requester){
				// pop off and append to front
				dto.users.unshift(dto.users.pop());
				break;
			}
		}
	}
	return dto
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

				var next = upcoming.getNextArray(tourneyId,players,1)
				// add next data for each user
				for(var i=0;i<tournamentData.length;i++){
					tournamentData[i].next = next[i];
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
					return cb(err,TourneyInterface.allStatsDto(tournamentData, seeded, requester))
				});
			});
		});
	});
};

TourneyInterface.updateSeedStatus = function(tourneySlug,cb) {
	tourneyMdl.updateSeedStatus(tourneySlug,function(err,results){
		if(err) return cb(err)
		return cb(null,results)
	});
};

module.exports = TourneyInterface;
