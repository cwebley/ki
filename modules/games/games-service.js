var _ = require('lodash'),
	async = require('async'),
	gamesMdl = require('./games-model'),
	usersMdl = require('../users/users-model')
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
		gamesMdl.insertGameResult(results, cb)
	})
};

GamesService.newTournament = function(options, cb) {
	gamesMdl.createTournament(options, function(err, results){
		if(err)return cb(err)
		return cb(null, results)
	})
};

module.exports = GamesService;
