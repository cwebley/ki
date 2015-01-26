var _ = require('lodash'),
	async = require('async'),
	gamesMdl = require('../games/games-model'),
	tourneyMdl = require('../tournaments/tournaments-model'),
	usersMdl = require('./users-model');

var UsersService = {};

UsersService.updateCharByName = function(tid,uid,cName,value,cb){
	usersMdl.getCharacterId(cName,function(err,cid){
		if(err) return cb(err)
		return cb(null, {tid:tid,uid:uid,cid:cid,value:value})
	});
};

UsersService.registerUser = function(options,cb){
	usersMdl.getUserId(options.username,function(err,userId){
		if(err)return cb(err)
		if(userId) return cb() //user already exists, redirect to login page

		usersMdl.createUser(options.username,options.password,options.email,function(err,results){
			return cb(err,results)
		});
	});
};

UsersService.seedCharacters = function(options, cb) {
	if(!options.characters) return cb()

	usersMdl.getUserId(options.username, function(err,uid){
		if(err) return cb(err)
		if(!uid) return cb()

		tourneyMdl.getTourneyId(options.tourneyName, function(err,tid){
			if(err) return cb(err)
			if(!tid) return cb()

			var calls = [];
			var generateFunc = function(tid, uid, cName, cValue) {
				return function(done) { UsersService.updateCharByName(tid,uid,cName,cValue,done) }
			}
			for(var c in options.characters){
				if(options.characters[c]){
					calls.push(generateFunc(tid,uid,c,options.characters[c]))
				}
			}

			async.parallel(calls, function(err, charArray){
				if(err)return cb(err)
				usersMdl.insertSeeds(charArray,function(err,results){
					return cb(err,results)
				});
			});
		});
	});
};

UsersService.login = function(options, cb) {
	usersMdl.verifyUser(options.username,options.password,function(err,uid){
		if(err)return cb(err)
		if(!uid)return cb()
		usersMdl.getActiveSeedStatus(uid,function(err,seedResults){
			if(err)return cb(err)
			return cb(null, seedResults)
		})
	})
};

module.exports = UsersService;
