var _ = require('lodash'),
	async = require('async'),
	gamesMdl = require('./games-model'),
	tourneyMdl = require('../tournaments/tournaments-model'),
	usersMdl = require('../users/users-model'),
	constants = require('../constants'),
	upcoming = require('../upcoming'),
	mysql = require('../persistence').mysql;

var GamesService = {};

GamesService.saveGame = function(options, cb) {

	GamesService.getAndValidateIds(options,function(err,validated){
		if(err)return cb(err)
		if(!validated) return cb() // no character value: seeding not done.

		var users=[validated.winPid,validated.losePid]
		if(!upcoming.check(validated.tourneyId,users)){
			upcoming.create(validated.tourneyId,users)
		}
		upcoming.removeFirst(validated.tourneyId)
		upcoming.fill(validated.tourneyId)

		var calls = {};
		calls.winnerValue = function(done){usersMdl.getCharacterValue(validated.tourneyId,validated.winPid,validated.winXid,done)}
		calls.loserValue = function(done){usersMdl.getCharacterValue(validated.tourneyId,validated.losePid,validated.loseXid,done)}

		async.parallel(calls,function(err,results){
			if(err)return cb(err)

			validated.winValue = results.winnerValue
			validated.loseValue = results.loserValue
			validated.supreme = options.supreme

			gamesMdl.insertGameResult(validated, function(err,gameResults){
				if(err)return cb(err)
				if(!gameResults) return cb()

				GamesService.updateData(validated,function(err,results,endTournament){
					return cb(err,results,endTournament)
				});
			});
		});
	});
};

GamesService.getAndValidateIds = function(options, cb) {
	var calls = {};
	calls.winPid = function(done){usersMdl.getUserId(options.winningPlayer, done)}
	calls.losePid = function(done){usersMdl.getUserId(options.losingPlayer, done)}
	calls.winXid = function(done){usersMdl.getCharacterId(options.winningCharacter, done)}
	calls.loseXid = function(done){usersMdl.getCharacterId(options.losingCharacter, done)}
	calls.tourneyId = function(done){tourneyMdl.getTourneyId(options.slug, done)}
	calls.tourneyPlayers = function(done){tourneyMdl.getPlayers(options.slug, done)}

	async.parallel(calls, function(err, results){
		if(err)return cb(err)
		if(!results.winPid || !results.losePid || !results.winXid || !results.loseXid) return cb()
		if(!results.tourneyId || !results.tourneyId.length) return cb()
		if(results.tourneyId[1] !== 1) return cb(new Error('game-submit-rejected--tournament-not-seeded'))

		// seeded value no longer matters.
		results.tourneyId = results.tourneyId[0]

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

GamesService.updateData = function(options, cb) {
	var streakCalls = {},
		updateCalls = [];
		
	//retrieve streaks to evaluate fire/ice status
	streakCalls.winXter = function(done){usersMdl.getCharacterStreak(options.tourneyId,options.winPid,options.winXid,done)}
	streakCalls.loseXter = function(done){usersMdl.getCharacterStreak(options.tourneyId,options.losePid,options.loseXid,done)}
	streakCalls.fireChars = function(done){gamesMdl.getFireChars(options.tourneyId,options.winPid,options.winXid,done)}

	async.parallel(streakCalls,function(err,streaks){
		if(err) return cb(err);

		//fire+ice
		if(streaks.loseXter.curStreak >= 3){
			updateCalls.push(function(done){gamesMdl.iceDown(options.tourneyId,options.losePid,options.loseXid,done)})
		}
		if(streaks.winXter.curStreak === 2){
			updateCalls.push(function(done){gamesMdl.fireUp(options.tourneyId,options.winPid,options.winXid,done)})
		}
		if(streaks.fireChars.length) {
			updateCalls.push(function(done){gamesMdl.updateFireWins(streaks.fireChars,options.tourneyId,options.winPid,done)})
		}

		//char data
		updateCalls.push(function(done){gamesMdl.incWinCharCurStreak(options.tourneyId,options.winPid,options.winXid,done)})
		updateCalls.push(function(done){gamesMdl.resetLoseCharCurStreak(options.tourneyId,options.losePid,options.loseXid,done)})
		updateCalls.push(function(done){gamesMdl.decWinCharValue(options.tourneyId,options.winPid,options.winXid,done)})
		updateCalls.push(function(done){gamesMdl.incLoseCharValue(options.tourneyId,options.losePid,options.loseXid,done)})
		updateCalls.push(function(done){gamesMdl.incWinCharWins(options.tourneyId,options.winPid,options.winXid,done)})
		updateCalls.push(function(done){gamesMdl.incLoseCharLosses(options.tourneyId,options.losePid,options.loseXid,done)})

		//user data
		updateCalls.push(function(done){gamesMdl.incWinUsersStreak(options.tourneyId,options.winPid,done)})
		updateCalls.push(function(done){gamesMdl.decLossUsersStreak(options.tourneyId,options.losePid,done)})
		updateCalls.push(function(done){gamesMdl.incWinUsersWins(options.tourneyId,options.winPid,done)})
		updateCalls.push(function(done){gamesMdl.incLoseUsersLosses(options.tourneyId,options.losePid,done)})
		updateCalls.push(function(done){gamesMdl.updateWinnerScore(options.tourneyId,options.winPid,options.winValue,done)})

		async.parallel(updateCalls,function(err,results){
			if(err)return cb(err)

			GamesService.checkAndUpdateTournament(options,function(err,endTournament){
				return cb(err,results,endTournament)
			});
		});
	});
};

GamesService.checkAndUpdateTournament = function(options, cb) {
	gamesMdl.getTournamentScores(options.tourneyId,function(err,scores){
		if(err)return cb(err)

		var calls = [],
			endTournament = false;

		// works because scores is sorted by score DESC
		// might cause a problem if someone's given a "chance to tie" after someone already won.
		if(scores[0].score >= scores[0].goal) {
			endTournament = true
			calls.push(function(done){tourneyMdl.recordChampion(options.tourneyId,scores[0].userId,done)})
		}

		if(!endTournament) return cb(null,endTournament) // tourney not over
		tourneyMdl.recordChampion(options.tourneyId,scores[0].userId,function(err,results){
			return cb(err,endTournament)
		});
	});
};

module.exports = GamesService;
