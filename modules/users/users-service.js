var _ = require('lodash'),
	async = require('async'),
	usersMdl = require('./users-model');

var UsersService = {};

UsersService.updateCharByName = function(uid,cName,value,cb){
	usersMdl.getCharacterId(cName,function(err,cid){
		if(err) return cb(err)
		usersMdl.updateCharacterValue(uid,cid,value,cb)
	});
};

UsersService.seedCharacters = function(options, cb) {
	usersMdl.getUserId(options.username, function(err,uid){
		if(err) return cb(err)
		var calls = {};
	
		if(!options.characters) return cb()

		var generateFunc = function(uid, cName, cValue) {
			return function(done) { UsersService.updateCharByName(uid,cName,cValue,done) }
		}
		for(var c in options.characters){
			if(options.characters[c]){
				calls[c] = generateFunc(uid,c,options.characters[c])
			}
		}
		async.parallel(calls, function(err, results){
			if(err)return cb(err)
			return cb(err, results)
		});
	});
};

module.exports = UsersService;
