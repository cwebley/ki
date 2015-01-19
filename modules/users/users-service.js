var _ = require('lodash'),
	async = require('async'),
	usersMdl = require('./users-model');

var UsersService = {};

UsersService.updateCharByName = function(uid,cName,value,cb){
	usersMdl.getCharacterId(cName,function(err,cid){
		console.log("CHARID: ", uid, cName, value,cid)
		if(err) return cb(err)
		usersMdl.updateCharacterValue(uid,cid,value,cb)
	});
};

var generateFunc = function(uid, cName, cValue) {
	console.log("generateFunc: ", uid, cName, cValue)
	return function(done) { UsersService.updateCharByName(uid,cName,cValue,done) }
}

UsersService.seedCharacters = function(options, cb) {
	usersMdl.getUserId(options.username, function(err,uid){
		if(err) return cb(err)
		var calls = {};
		// calls.uid = function(done){usersMdl.getUserId(options.username, done)}
	
		if(!options.characters) return cb()
		
		for(var c in options.characters){
			if(options.characters[c]){
				calls[c] = generateFunc(uid,c,options.characters[c])
			}
		}
		async.parallel(calls, function(err, results){
			console.log("REZZZZ: ", results)
			if(err)return cb(err)
	
			// var updates = [];
			// for(var cid in results){
			// 	updates.push(function(done){usersMdl.udpateCharacterValue(uid,results[cid],)})
			// }
	
			return cb(err, results)
		});
	});
};

module.exports = UsersService;
