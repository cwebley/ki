var _ = require('lodash'),
	async = require('async'),
	gamesMdl = require('../games/games-model'),
	tourneyMdl = require('../tournaments/tournaments-model'),
	usersMdl = require('./users-model'),
	historyMdl = require('../history/history-model');

var UsersService = {};

UsersService.getCharIdWrapper = function(tid,uid,cName,value,cb){
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
			return cb(err,results.insertId)
		});
	});
};

UsersService.seedCharacters = function(options, cb) {
	if(!options.characters) return cb()

	usersMdl.getUserId(options.username, function(err,uid){
		if(err) return cb(err)
		if(!uid) return cb()

		tourneyMdl.getTourneyId(options.tourneySlug, function(err,tid){
			if(err) return cb(err)
			if(!tid) return cb()

			var calls = [];
			var characterIdGetter = function(tid, uid, cName, cValue) {
				return function(done) { UsersService.getCharIdWrapper(tid,uid,cName,cValue,done) }
			}
			for(var c in options.characters){
				if(options.characters[c]){
					calls.push(characterIdGetter(tid,uid,c,options.characters[c]))
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
			return cb(null,seedResults,uid)
		})
	})
};

UsersService.updateCharacterValue = function(tid,uid,cid,postUpdateValue,change,cb) {
	usersMdl.updateCharacterValue(tid,uid,cid,change,function(err,results){
		if(err) return cb(err)
		if(!results) return cb();

		var data = {
			tid: tid,
			uid: uid,
			cid: cid,
			value: postUpdateValue,
			delta: change,
			eventString: 'character-adjustment'
		}
		historyMdl.recordEvent(data,function(err,historyRes){
			if(err){
				console.log("error recording history for updateCharacterValue: ", JSON.stringify(data,null,4));
			}
			return cb(null,results);
		});
	});
};

module.exports = UsersService;