var _ = require('lodash'),
	async = require('async'),
	usersSvc = require('./users-service'),
	usersMdl = require('./users-model'),
	mysql = require('../persistence').mysql;

var UsersInterface = {};

UsersInterface.userListDto = function(data){
	if(!data || !data.length) data = [];
	return {users:data}
}

UsersInterface.register = function(options, cb) {
	usersSvc.registerUser(options,cb)
};

UsersInterface.login = function(options, cb) {
	usersMdl.verifyUser(options.username,options.password,cb)
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


module.exports = UsersInterface;
