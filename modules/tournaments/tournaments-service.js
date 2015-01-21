var _ = require('lodash'),
	async = require('async'),
	usersMdl = require('../users/users-model'),
	tourneyMdl = require('./tournaments-model'),
	constants = require('../constants'),
	mysql = require('../persistence').mysql;

var tournamentsService = {};

tournamentsService.zeroCharValsByUid = function(tid,uid,cb){
	usersMdl.getAllCharacterIds(function(err, characterIds){
		if(err)return cb(err)
		usersMdl.insertOrResetCharVals(uid,characterIds,cb);
	});
}

tournamentsService.newTournament = function(options, cb) {
	if(!options.players || !options.players.length) return cb(new Error('no-players-specified-for-tournament'))

	var userIdCalls = [];
	var generateUserId = function(username){
		return function(done){usersMdl.getUserId(username,done)}
	}
	for(var i=0; i<options.players.length; i++){
		userIdCalls.push(generateUserId(options.players[i]))
	}
	async.parallel(userIdCalls, function(err,userIdRes){
		if(err) return cb(err)
		if(!userIdRes.length || userIdRes.length !== options.players.length){
			var err = new Error('users-not-found-in-user-table')
			return cb(err)
		}

		tourneyMdl.createTournament(options, function(err, tid){
			if(err)return cb(err)

			usersMdl.resetUsersData(userIdRes,function(err,usersDataRes){
				if(err) return cb(err)

				tourneyMdl.insertPlayers(tid,userIdRes,function(err,insertPlayerRes){
					if(err) return cb(err)
						
					var zeroCharCalls = [];
					var generateZeroCharVals = function(tid,uid){
						return function(done){tournamentsService.zeroCharValsByUid(tid,uid,done)}
					}
					for(var i=0; i<userIdRes.length; i++){
						zeroCharCalls.push(generateZeroCharVals(tid, userIdRes[i]))
					}
					async.parallel(zeroCharCalls, function(err,results){
						return cb(err,results)
					});
				});
			});
		});
	});
};

// data: array of usersData
tournamentsService.allStatsDto = function(data,cb){
	var dto = {_embedded: {users: []}};
	for (var i=0;i<data.length;i++){
		dto._embedded.users.push(data[i])
	}
	return dto
};

tournamentsService.getAllTourneyStats = function(tourneyName,cb){
	tourneyMdl.getStats(tourneyName, function(err,tournamentData){
		if(err)return cb(err)

		async.map(tournamentData,tourneyMdl.getCharacterStats,function(err,charData){
			if(err) return cb(err)
			for(var i=0;i<tournamentData.length;i++){
				tournamentData[i].characters = charData[i]
			}
			return cb(err,tournamentsService.allStatsDto(tournamentData))
		});
	});
};

module.exports = tournamentsService;
