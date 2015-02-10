var _ = require('lodash'),
	async = require('async'),
	constants = require('../constants'),
	usersSvc = require('./users-service'),
	usersMdl = require('./users-model'),
	auth = require('../auth'),
	mysql = require('../persistence').mysql;

var UsersInterface = {};

var userListDto = function(data){
	if(!data || !data.length) data = [];
	return {users:data}
}

var loginDto = function(username,uid,seedData){
	var dto = {
		user: {
			username:username,
			userId: uid
		}
	}
	if(seedData && seedData.length){
		dto.seeded={}
		for(var i=0;i<seedData.length;i++){
			if(seedData[i].seeded){
				dto.seeded[seedData[i].name] = true
			}
		}
	}

	return dto
}

UsersInterface.register = function(options, cb) {
	usersSvc.registerUser(options,function(err,userId){
		if(err) return cb(err)
		return cb(null,loginDto(options.username,userId))
	})
};

UsersInterface.login = function(options, cb) {
	usersSvc.login(options,function(err,seedStatus,uid){
		if(err)return cb(err)
		if(!seedStatus) return cb()
		var dto = loginDto(options.username,uid,seedStatus)
		// auth.createAndSetToken(dto,function(err,results){
		// 	console.log("USER INT CREATE AND SET RES ", results)
			return cb(err, dto)
		});
	});
};

UsersInterface.seedCharacters = function(options, cb) {
	usersSvc.seedCharacters(options, cb)
};

UsersInterface.getUserList = function(creatorsName, cb) {
	usersMdl.getUserList(creatorsName, function(err,results){
		if(err)return cb(err)
		return cb(null,userListDto(results))
	});
};

UsersInterface.getOpponentsNames = function(seederName,tourneyName,cb) {
	usersMdl.getOpponentsNames(seederName,tourneyName, function(err,results){
		if(err)return cb(err)
		return cb(null,userListDto(results))
	});
};

UsersInterface.verifySeeds = function(seeds) {
	var c = constants.characters;
	var numberHash = {};

	// make sure all characters accounted for
	for(var i=0;i<c.length;i++){
		if(!seeds[c[i]]){
			return false
		}
		numberHash[i+1] = true // jump in this loop to make a number hash
	}
	// make sure all whole numbers accounted for once and only once
	for(var s in seeds){
		if(!numberHash[seeds[s]]){
			return false
		}
		delete numberHash[seeds[s]]
	}
	return true
};


module.exports = UsersInterface;
