var _ = require('lodash'),
	async = require('async'),
	upcoming = require('../upcoming'),
	tourneySvc = require('./tournaments-service'),
	tourneyMdl = require('./tournaments-model');

var TourneyInterface = {};

// data: array of user-data objects
TourneyInterface.allStatsDto = function(data,nextMatch){
	var dto = {users: [],next: nextMatch};

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

TourneyInterface.getTourneyList = function(cb) {
	tourneySvc.getTourneyList(function(err,results){
		if(err) return cb(err)
		return cb(null,TourneyInterface.listDto(results))
	});
};

TourneyInterface.getAllTourneyStats = function(tourneyName,peek,cb) {
	// verify tourney name valid
	tourneyMdl.getTourneyId(tourneyName,function(err,tourneyId){
		if(err) return cb(err)
		if(!tourneyId) return cb()

		// get next matchup
		var next = upcoming.getNext(peek)
		tourneySvc.getUsersLevelStats(tourneyName, function(err,tournamentData){
			if(err)return cb(err)
	
			// get the stats
			async.map(tournamentData,function(tournamentData,done){tourneySvc.getCharacterLevelStats(tournamentData.name,done)},function(err,charData){
				if(err) return cb(err)
				for(var i=0;i<tournamentData.length;i++){
					tournamentData[i].characters = charData[i]
				}
				return cb(err,TourneyInterface.allStatsDto(tournamentData, next))
			});
		});
	});
};

module.exports = TourneyInterface;
