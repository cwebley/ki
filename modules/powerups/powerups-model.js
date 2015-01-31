var _ = require('lodash'),
	async = require('async'),
	constants = require('../constants'),
	redis = require('../persistence').redis;

var PowerModel = {};

/*
	key generation
*/
var userStockKey = function(tourneyName,userName) {
	return tourneyName + ':' + userName + ':stock'
};
var inspectStatusKey = function(tourneyName) {
	return tourneyName + ':inspect'
};
var userInspectKey = function(tourneyName,userName) {
	return tourneyName + ':' + userName + ':inspect'
};


/*
	user stock
*/
PowerModel.getUserStock = function(tourneyName,userName,cb) {
	var conn = redis.get('persistent', 'rw'),
		key = userStockKey(tourneyName,userName);
	conn.setnx(key, cb);
};
PowerModel.setUserStock = function(tourneyName,userName,cb) {
	var conn = redis.get('persistent', 'rw'),
		key = userStockKey(tourneyName,userName);
	conn.set(key, constants._STARTING_PWR_STOCK, cb);
};
PowerModel.incrUserStock = function(tourneyName,userName,cb) {
	var conn = redis.get('persistent', 'rw'),
		key = userStockKey(tourneyName,userName);
	conn.incr(key, cb);
};
PowerModel.decrUserStock = function(tourneyName,userName,cb) {
	var conn = redis.get('persistent', 'rw'),
		key = userStockKey(tourneyName,userName);
	conn.decr(key, cb);
};

/*
	inspect
*/
PowerModel.getInspectStatus = function(tourneyName,userName,cb) {
	var conn = redis.get('persistent', 'rw'),
		key = inspectStatusKey(tourneyName);
	conn.get(key, cb);
};
PowerModel.setnxInspectStatus = function(tourneyName,userName,cb) {
	var conn = redis.get('persistent', 'rw'),
		key = inspectStatusKey(tourneyName);
	conn.setnx(key, userName, cb);
};
PowerModel.getUserInspect = function(tourneyName,userName,cb) {
	var conn = redis.get('persistent', 'rw'),
		key = userInspectKey(tourneyName,userName);
	conn.get(key, cb);
};
PowerModel.decrUserInspect = function(tourneyName,userName,cb) {
	var conn = redis.get('persistent', 'rw'),
		key = userInspectKey(tourneyName,userName);
	conn.decr(key, cb);
};
PowerModel.setUserInspect = function(tourneyName,userName,cb) {
	var conn = redis.get('persistent', 'rw'),
		key = userInspectKey(tourneyName,userName);
	conn.set(key, constants._INSPECT_COUNT, cb);
};



module.exports = PowerModel;
