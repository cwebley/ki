var _ = require('lodash'),
	async = require('async')
	tourneySvc = require('./tournaments-service');

var TourneyInterface = {};

// data: array of usersData
TourneyInterface.allStatsDto = function(data,cb){
	var dto = {_embedded: {users: []}};
	for (var i=0;i<data.length;i++){
		dto._embedded.users.push(data[i])
	}
	return dto
};

TourneyInterface.newTournament = function(options, cb) {
	tourneySvc.newTournament(options, function(err, results){
		return cb(err,results)
	});
};

TourneyInterface.getAllTourneyStats = function(tourneyName, cb) {
	tourneySvc.getUsersLevelStats(tourneyName, function(err,tournamentData){
		if(err)return cb(err)

		async.map(tournamentData,function(tournamentData,done){tourneySvc.getCharacterLevelStats(tournamentData.name,done)},function(err,charData){
			if(err) return cb(err)
			for(var i=0;i<tournamentData.length;i++){
				tournamentData[i].characters = charData[i]
			}
			return cb(err,TourneyInterface.allStatsDto(tournamentData))
		});
	});
};

TourneyInterface.getTourneyStats = function(name, cb) {
	tourneySvc.getTourneyStats(name, function(err, results){
		if(err)return cb(err)
		return cb(err,results)
	});
};

module.exports = TourneyInterface;
