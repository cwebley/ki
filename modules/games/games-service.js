var _ = require('lodash'),
	async = require('async'),
	gamesMdl = require('./games-model'),
	usersMdl = require('../users/users-model'),
	constants = require('../constants'),
	mysql = require('../persistence').mysql;

var GamesService = {};

GamesService.saveGame = function(options, cb) {
	var calls = {};
	calls.winPid = function(done){usersMdl.getUserId(options.winningPlayer, done)}
	calls.losePid = function(done){usersMdl.getUserId(options.losingPlayer, done)}
	calls.winXid = function(done){usersMdl.getCharacterId(options.winningCharacter, done)}
	calls.loseXid = function(done){usersMdl.getCharacterId(options.losingCharacter, done)}
	calls.tourneyId = function(done){gamesMdl.getTourneyId(options.tournament, done)}

	async.parallel(calls, function(err, results){
		if(err)return cb(err)
		if(!results.winPid || !results.losePid || !results.winXid || !results.loseXid || !results.tourneyId) return cb()
		if(results.winPid === results.losePid) return cb()

		usersMdl.getCharacterValue(results.winPid,results.winXid,function(err,value){
			if(err)return cb(err)
			if(!value)return cb()
			results.value = value

			gamesMdl.insertGameResult(results, cb)
		});
	});
};

GamesService.zeroCharValsByName = function(tid,username,cb){
	usersMdl.getUserId(username, function(err,uid){
		if(err)return cb(err)

		usersMdl.getAllCharacterIds(function(err, characterIds){
			if(err)return cb(err)

			usersMdl.insertOrResetCharVals(uid,characterIds,cb);
		});
	});
}

GamesService.newTournament = function(options, cb) {
	if(!options.players || !options.players.length) return cb(new Error('no-players-specified-for-tournament'))

	gamesMdl.createTournament(options, function(err, tid){
		if(err)return cb(err)

		var calls = [];
	
		var generateFunc = function(tid,username){
			return function(done){GamesService.zeroCharValsByName(tid,username,done)}
		}
	
		for(var i=0; i<options.players.length; i++){
			calls.push(generateFunc(tid, options.players[i]))
		}
		async.parallel(calls, function(err,results){
			return cb(err,results)
		});
	});
};

module.exports = GamesService;
