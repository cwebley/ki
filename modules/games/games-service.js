var _ = require('lodash'),
	async = require('async'),
	gamesMdl = require('./games-model'),
	tourneyMdl = require('../tournaments/tournaments-model'),
	usersMdl = require('../users/users-model'),
	constants = require('../constants'),
	mysql = require('../persistence').mysql;

var GamesService = {};

GamesService.getAndValidateIds = function(options, cb) {
	var calls = {};
	calls.winPid = function(done){usersMdl.getUserId(options.winningPlayer, done)}
	calls.losePid = function(done){usersMdl.getUserId(options.losingPlayer, done)}
	calls.winXid = function(done){usersMdl.getCharacterId(options.winningCharacter, done)}
	calls.loseXid = function(done){usersMdl.getCharacterId(options.losingCharacter, done)}
	calls.tourneyId = function(done){tourneyMdl.getTourneyId(options.tournament, done)}
	calls.tourneyPlayers = function(done){tourneyMdl.getPlayers(options.tournament, done)}

	async.parallel(calls, function(err, results){
		if(err)return cb(err)
		if(!results.winPid || !results.losePid || !results.winXid || !results.loseXid || !results.tourneyId) return cb()
		if(results.winPid === results.losePid) return cb()
		if(!results.tourneyPlayers.length) return cb()

		var validWinner, validLoser;

		for(var i=0; i<results.tourneyPlayers.length;i++){
			if(results.winPid === results.tourneyPlayers[i]){
				validWinner = true
			}
			if(results.losePid === results.tourneyPlayers[i]){
				validLoser = true
			}
		}
		if(!validWinner || !validLoser) return cb()
		return cb(results)
	});
};

GamesService.saveGame = function(options, cb) {

	GamesService.getAndValidateIds(options,function(err,validated){
		if(err)return cb(err)
		if(!validated) return cb()

		usersMdl.getCharacterValue(validated.winPid,validated.winXid,function(err,value){
			if(err)return cb(err)
			if(!value)return cb()
			validated.value = value
			gamesMdl.insertGameResult(validated, function(err,gameId){
				if(err)return cb(err)
				if(!gameId) return cb()

				GamesService.updateCharData(validated,function(err,results){
					return cb(err,results)
				});
			});
		});
	});
};

GamesService.updateCharData = function(options, cb) {

/*
	check for fire first and ice down if necessary.
	gamesMdl.updateCurStreaks(options,function(err,results){
		//UPDATE table SET field = field + 1 WHERE [...]
		gamesMdl.updateValues

	streaks+values in 1 statement? above is fine if i keep the 2 columns, curwin/ curloss streak
		UPDATE table SET Col1 = CASE id 
		                          WHEN 1 THEN 1 
		                          WHEN 2 THEN 2 
		                          WHEN 4 THEN 10 
		                          ELSE Col1 
		                        END, 
		                 Col2 = CASE id 
		                          WHEN 3 THEN 3 
		                          WHEN 4 THEN 12 
		                          ELSE Col2 
		                        END
		             WHERE id IN (1, 2, 3, 4);

	});

	EVALUATE FIRE + RIVALS

	return cb(null, results)
*/
};

module.exports = GamesService;
