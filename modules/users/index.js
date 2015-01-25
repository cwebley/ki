var _ = require('lodash'),
	async = require('async'),
	usersSvc = require('./users-service'),
	usersMdl = require('./users-model'),
	mysql = require('../persistence').mysql;

var UsersInterface = {};

UsersInterface.register = function(options, cb) {
	usersSvc.registerUser(options,cb)
};

UsersInterface.login = function(options, cb) {
	usersMdl.verifyUser(options.username,options.password,cb)
};

UsersInterface.seedCharacters = function(options, cb) {
	usersSvc.seedCharacters(options, cb)
};


module.exports = UsersInterface;
