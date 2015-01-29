var _ = require('lodash'),
	async = require('async'),
	usersMdl = require('../users/users-model'),
	gamesMdl = require('../games/games-model'),
	tourneyMdl = require('./tournaments-model'),
	constants = require('../constants'),
	upcoming = require('../upcoming'),
	mysql = require('../persistence').mysql;

var tournamentsService = {};

tournamentsService.zeroCharValsByUid = function(tid,uid,cb){
	usersMdl.getAllCharacterIds(function(err, characterIds){
		if(err)return cb(err)
		usersMdl.insertOrResetCharVals(tid,uid,characterIds,cb);
	});
}

tournamentsService.newTournament = function(options, cb) {
	if(!options.players || !options.players.length) return cb(new Error('no-players-specified-for-tournament'))

	var userIdCalls = [];
	var userIdGetter = function(username){
		return function(done){usersMdl.getUserId(username,done)}
	}
	for(var i=0; i<options.players.length; i++){
		userIdCalls.push(userIdGetter(options.players[i]))
	}
	async.parallel(userIdCalls, function(err,userIds){
		if(err) return cb(err)
		if(!userIds.length || userIds.length !== options.players.length){
			var err = new Error('users-not-found-in-user-table')
			return cb(err)
		}

		//initialize upcoming match arrays
		upcoming.create(options.players)
		upcoming.fill()

		tourneyMdl.createTournament(options, function(err, tid){
			if(err)return cb(err)

			tourneyMdl.insertPlayers(tid,userIds,function(err,insertPlayerRes){
				if(err) return cb(err)
					
				var zeroCharCalls = [];
				var generateZeroCharVals = function(tid,uid){
					return function(done){tournamentsService.zeroCharValsByUid(tid,uid,done)}
				}
				for(var i=0; i<userIds.length; i++){
					zeroCharCalls.push(generateZeroCharVals(tid, userIds[i]))
				}
				async.parallel(zeroCharCalls, function(err,results){
					return cb(err,results)
				});
			});
		});
	});
};

tournamentsService.getUsersLevelStats = function(tourneyName,cb){
	tourneyMdl.getStats(tourneyName, function(err,results){
		return cb(err,results)
	});
};

tournamentsService.getCharacterLevelStats = function(tourneyName,userName,cb){
	tourneyMdl.getCharacterStats(tourneyName,userName,function(err,results){
		return cb(err,results)
	});
};

tournamentsService.getTourneyList = function(cb){
	tourneyMdl.getTourneyList(function(err, results){
		if(err)return cb(err)
		return cb(null,results);
	});
}

tournamentsService.endTournament = function(options,cb){	
	tourneyMdl.getTourneyId(options.name,function(err,tid){
		if(err) return cb(err)

		gamesMdl.getTournamentScores(tid,function(err,scores){
			if(err)return cb(err)

			var generateRecordScore = function(tid,uid,score){
				return function(done){tourneyMdl.recordFinalScore(tid,uid,score,done)}
			}

			var calls = [];
			if (scores && scores.length){
				calls.push(function(done){tourneyMdl.recordChampion(tid,scores[0].userId,done)})
			}
			for(var i=0;i<scores.length;i++){
				calls.push(generateRecordScore(tid,scores[i].userId,scores[i].score))
			}
			async.parallel(calls,function(err,results){
				if(err) return cb(err)
				return cb(null, results)
			});
		});
	});
};

tournamentsService.editTournament = function(options,cb){
	var calls = [];
	calls.push(function(done){tourneyMdl.editTournament(options.name,options.goal,options.oldName,done)})

	if(options.surrender) calls.push(function(done){tournamentsService.endTournament(options,done)})

	async.series(calls,function(err,results){
		if(err) return cb(err)
		if(!results.affectedRows){
			return cb()
		}
		return cb(null,results)
	});
};

tournamentsService.updateSeedStatus = function(options,cb){
	
};


module.exports = tournamentsService;
