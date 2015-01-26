var _ = require('lodash'),
	async = require('async'),
	constants = require('../constants'),
	usersSvc = require('./users-service'),
	usersMdl = require('./users-model'),
	mysql = require('../persistence').mysql;

var UsersInterface = {};

UsersInterface.userListDto = function(data){
	if(!data || !data.length) data = [];
	return {users:data}
}

UsersInterface.loginDto = function(data){
	var dto = {seeded: {}}
	for(var i=0;i<data.length;i++){
		if(data[i].seeded){
			dto.seeded[data[i].name] = true
		}
	}
	return dto
}

UsersInterface.register = function(options, cb) {
	usersSvc.registerUser(options,cb)
};

UsersInterface.login = function(options, cb) {
	usersSvc.login(options.username,options.password,function(err,results){
		if(err)return cb(err)
		if(!results) return cb()
		return cb(null, loginDto(results))
	})
};

UsersInterface.seedCharacters = function(options, cb) {
	usersSvc.seedCharacters(options, cb)
};

UsersInterface.getUserList = function(creatorsName, cb) {
	usersMdl.getUserList(creatorsName, function(err,results){
		if(err)return cb(err)
		return cb(null,UsersInterface.userListDto(results))
	});
};

UsersInterface.getOpponentsNames = function(seederName,tourneyName,cb) {
	usersMdl.getOpponentsNames(seederName,tourneyName, function(err,results){
		if(err)return cb(err)
		return cb(null,UsersInterface.userListDto(results))
	});
};

UsersInterface.verifySeeds = function(seeds) {
	console.log("VERIFY SEEDS: ", seeds)
	var c = constants.characters;
	var numberHash = {};

	// make sure all characters accounted for
	for(var i=0;i<c.length;i++){
		if(!seeds[c]){
			return false
		}
		numberHash[i+1] = true
	}

	// make sure all whole numbers accounted for
	for(var s in seeds){
		if(!numberHash[seeds[s]]){
			return false
		}
	}
	return true
};


module.exports = UsersInterface;
