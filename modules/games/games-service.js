var _ = require('lodash'),
	async = require('async'),
	gamesMdl = require('./games-model'),
	tourneyMdl = require('../tournaments/tournaments-model'),
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
	calls.tourneyId = function(done){tourneyMdl.getTourneyId(options.tournament, done)}

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

module.exports = GamesService;
