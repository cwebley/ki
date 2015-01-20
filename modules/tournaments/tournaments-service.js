var _ = require('lodash'),
	async = require('async'),
	usersMdl = require('../users/users-model'),
	tourneyMdl = require('./tournaments-model'),
	constants = require('../constants'),
	mysql = require('../persistence').mysql;

var tournamentsService = {};

tournamentsService.zeroCharValsByName = function(tid,username,cb){
	usersMdl.getUserId(username, function(err,uid){
		if(err)return cb(err)

		usersMdl.getAllCharacterIds(function(err, characterIds){
			if(err)return cb(err)

			usersMdl.insertOrResetCharVals(uid,characterIds,cb);
		});
	});
}

tournamentsService.newTournament = function(options, cb) {
	if(!options.players || !options.players.length) return cb(new Error('no-players-specified-for-tournament'))

	tourneyMdl.createTournament(options, function(err, tid){
		if(err)return cb(err)

		var calls = [];
	
		var generateFunc = function(tid,username){
			return function(done){tournamentsService.zeroCharValsByName(tid,username,done)}
		}
	
		for(var i=0; i<options.players.length; i++){
			calls.push(generateFunc(tid, options.players[i]))
		}
		async.parallel(calls, function(err,results){
			return cb(err,results)
		});
	});
};

module.exports = tournamentsService;
