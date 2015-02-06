var _ = require('lodash'),
	async = require('async'),
	upcoming = require('../upcoming'),
	tourneySvc = require('./tournaments-service'),
	tourneyMdl = require('./tournaments-model');

var TourneyInterface = {};

// data: array of user-data objects
TourneyInterface.allStatsDto = function(data,nextMatch,seeded){
	var dto = {users: [],next: nextMatch,seeded: seeded};

	for (var i=0;i<data.length;i++){
		dto.users.push(data[i])
	}
	return dto
};

// data: array of user-data objects
TourneyInterface.listDto = function(data){
	return {tournaments: data}
};

TourneyInterface.newTournament = function(options, cb) {
	tourneySvc.newTournament(options, function(err, results){
		return cb(err,results)
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

TourneyInterface.getTourneyInfo = function(tourneyName,cb) {
	tourneyMdl.getTourneyInfo(tourneyName,function(err,results){
		if(err) return cb(err)
		return cb(null,results)
	});
};

TourneyInterface.getAllTourneyStats = function(tourneyName,cb) {
	// verify tourney name valid
	tourneyMdl.getTourneyId(tourneyName,function(err,tourneyId,seeded){
		if(err) return cb(err)
		if(!tourneyId) return cb()

		// getuser stats
		tourneySvc.getUsersLevelStats(tourneyName, function(err,tournamentData){
			if(err)return cb(err)

			tourneyMdl.getPlayersNamesIds(tourneyName,function(err,players){
				if(err) return cb(err)
				var uids = _.pluck(players,'id')

				// get next matchup, populate if necessary (ie: server was restarted and memory wiped)
				if(!upcoming.check(tourneyId,uids)){
					upcoming.create(tourneyId,uids)
				}

				var next = upcoming.getNext(tourneyId,players,1)
	
				// get stats for each character
				var calls = [];
				var characterDataGetter = function(tourneyName,userName){
					return function(done){tourneySvc.getCharacterLevelStats(tourneyName,userName,done)}
				}
				for(var i=0;i<tournamentData.length;i++){
					calls.push(characterDataGetter(tourneyName,tournamentData[i].name))
				}
				async.parallel(calls,function(err,charData){
					if(err) return cb(err)
					for(var i=0;i<tournamentData.length;i++){
						tournamentData[i].characters = charData[i]
					}
					return cb(err,TourneyInterface.allStatsDto(tournamentData, next, seeded))
				});
			});
		});
	});
};

TourneyInterface.updateSeedStatus = function(tourneyName,cb) {
	tourneyMdl.updateSeedStatus(tourneyName,function(err,results){
		if(err) return cb(err)
		return cb(null,results)
	});
};

module.exports = TourneyInterface;
