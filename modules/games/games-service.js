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
		return cb(null, results)
	});
};

GamesService.saveGame = function(options, cb) {

	GamesService.getAndValidateIds(options,function(err,validated){
		if(err)return cb(err)
		if(!validated) return cb() // no character value: seeding not done.

		usersMdl.getCharacterValue(validated.winPid,validated.winXid,function(err,value){

			if(err)return cb(err)
			if(!value)return cb()
			validated.value = value
			validated.supreme = options.supreme

			gamesMdl.insertGameResult(validated, function(err,gameId){
				if(err)return cb(err)
				if(!gameId) return cb()

				GamesService.updateData(validated,function(err,results,endTournament){
					return cb(err,results,endTournament)
				});
			});
		});
	});
};

GamesService.updateData = function(options, cb) {
	var streakCalls = {},
		updateCalls = [];
		
	//retrieve streaks to evaluate fire/ice
	streakCalls.winXter = function(done){usersMdl.getCharacterStreak(options.winPid,options.winXid,done)}
	streakCalls.loseXter = function(done){usersMdl.getCharacterStreak(options.losePid,options.loseXid,done)}

	async.parallel(streakCalls,function(err,streaks){

		if(err)return cb(err)
		//fire
		if(streaks.loseXter >= 3){
			updateCalls.push(function(done){gamesMdl.iceDown(options.losePid,options.loseXid,done)})
		}
		if(streaks.winXter === 2){
			updateCalls.push(function(done){gamesMdl.fireUp(options.winPid,options.winXid,done)})
		}
		//char data
		updateCalls.push(function(done){gamesMdl.incWinCharCurStreak(options.winPid,options.winXid,done)})
		updateCalls.push(function(done){gamesMdl.resetLoseCharCurStreak(options.losePid,options.loseXid,done)})
		updateCalls.push(function(done){gamesMdl.decWinCharValue(options.winPid,options.winXid,done)})
		updateCalls.push(function(done){gamesMdl.incLoseCharValue(options.losePid,options.loseXid,done)})
	
		//user data
		updateCalls.push(function(done){gamesMdl.incWinUsersStreak(options.winPid,done)})
		updateCalls.push(function(done){gamesMdl.decLossUsersStreak(options.losePid,done)})
		updateCalls.push(function(done){gamesMdl.incWinUsersGames(options.winPid,done)})
		updateCalls.push(function(done){gamesMdl.decLossUsersGames(options.losePid,done)})
		updateCalls.push(function(done){gamesMdl.updateWinnerScore(options.winPid,options.value,done)})

		async.parallel(updateCalls,function(err,results){
			if(err)return cb(err)

			GamesService.checkAndUpdateTournament(options,function(err,endTournament){
				return cb(err,results,endTournament)
			})
		});
	});
};

GamesService.checkAndUpdateTournament = function(options, cb) {
	gamesMdl.getTournamentScores(options.tourneyId,function(err,scores){
		if(err)return cb(err)

		var calls = [],
		endTournament = false;

		var generateRecordScore = function(tid,uid,score){
			return function(done){tourneyMdl.recordFinalScore(tid,uid,score,done)}
		}

		// works because scores sorted score DESC
		if(scores[0].score >= scores[0].goal) {
			endTournament = true
			calls.push(function(done){tourneyMdl.recordChampion(options.tourneyId,scores[0].userId,done)})
			for(var i=0; i<scores.length; i++){
				calls.push(generateRecordScore(options.tourneyId,scores[i].userId,scores[i].score))
			}
		}
		if(!calls.length) return cb(null,endTournament)
		
		async.parallel(calls,function(err,results){
			return cb(err,endTournament)
		});
	});
};

module.exports = GamesService;
