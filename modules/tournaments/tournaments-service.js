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
	var generateFunc = function(username){
		return function(done){usersMdl.getUserId(username,done)}
	}
	for(var i=0; i<options.players.length; i++){
		userIdCalls.push(generateFunc(options.players[i]))
	}
	async.parallel(userIdCalls, function(err,userIdRes){
		if(err) return cb(err)
		if(!userIdRes.length || userIdRes.length !== options.players.length){
			var err = new Error('users-not-found-in-user-table')
			return cb(err)
		}

		tourneyMdl.createTournament(options, userIdRes, function(err, tid){
			if(err)return cb(err)

			var zeroCharCalls = [];
			var generateFunc = function(tid,uid){
				return function(done){tournamentsService.zeroCharValsByUid(tid,uid,done)}
			}
			for(var i=0; i<userIdRes.length; i++){
				zeroCharCalls.push(generateFunc(tid, userIdRes[i]))
			}
			async.parallel(zeroCharCalls, function(err,results){
				return cb(err,results)
			});
		});

	});
};

tournamentsService.getTourneyStats = function(tourneyName,cb){
	tourneyMdl.getPlayers(tourneyName, function(err,playerResults){
		if(err)return cb(err)
		return cb(null,playerResults)
		// todo query for stats and stuff
	});
}

module.exports = tournamentsService;
