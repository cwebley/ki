var _ = require('lodash'),
	async = require('async'),
	gamesMdl = require('../games/games-model'),
	usersMdl = require('./users-model');

var UsersService = {};

UsersService.updateCharByName = function(tid,uid,cName,value,cb){
	usersMdl.getCharacterId(cName,function(err,cid){
		if(err) return cb(err)
		return cb(null, {tid:tid,uid:uid,cid:cid,value:value})
	});
};

UsersService.seedCharacters = function(options, cb) {
	if(!options.characters) return cb()

	usersMdl.getUserId(options.username, function(err,uid){
		if(err) return cb(err)
		if(!uid) return cb()

		gamesMdl.getTourneyId(options.tourneyName, function(err,tid){
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

module.exports = UsersService;
