var _ = require('lodash'),
	async = require('async'),
	constants = require('../constants'),
	redis = require('../persistence').redis;

var PowerModel = {};

/*
	key generation
*/
var userStockKey = function(tourneyId,userId) {
	return tourneyId + ':' + userId + ':stock'
};
var inspectStatusKey = function(tourneyId) {
	return tourneyId + ':inspect'
};
var userInspectKey = function(tourneyId,userId) {
	return tourneyId + ':' + userId + ':inspect'
};


/*
	user stock
*/
PowerModel.getUserStock = function(tourneyId,userId,cb) {
	var conn = redis.get('persistent', 'rw'),
		key = userStockKey(tourneyId,userId);
	conn.setnx(key, cb);
};
PowerModel.setUserStock = function(tourneyId,userId,cb) {
	var conn = redis.get('persistent', 'rw'),
		key = userStockKey(tourneyId,userId);
	conn.set(key, constants._STARTING_PWR_STOCK, cb);
};
PowerModel.incrUserStock = function(tourneyId,userId,cb) {
	var conn = redis.get('persistent', 'rw'),
		key = userStockKey(tourneyId,userId);
	conn.incr(key, cb);
};
PowerModel.decrUserStock = function(tourneyId,userId,cb) {
	var conn = redis.get('persistent', 'rw'),
		key = userStockKey(tourneyId,userId);
	conn.decr(key, cb);
};

/*
	inspect
*/
PowerModel.getInspectStatus = function(tourneyId,cb) {
	var conn = redis.get('persistent', 'rw'),
		key = inspectStatusKey(tourneyId);
	conn.get(key, cb);
};
PowerModel.setnxInspectStatus = function(tourneyId,userId,cb) {
	var conn = redis.get('persistent', 'rw'),
		key = inspectStatusKey(tourneyId);
	conn.setnx(key, userId, cb);
};

// returns the inspect count
PowerModel.getUserInspect = function(tourneyId,userId,cb) {
	var conn = redis.get('persistent', 'rw'),
		key = userInspectKey(tourneyId,userId);
	conn.get(key, cb);
};
PowerModel.decrUserInspect = function(tourneyId,userId,cb) {
	var conn = redis.get('persistent', 'rw'),
		key = userInspectKey(tourneyId,userId);
	conn.decr(key, cb);
};
PowerModel.setUserInspect = function(tourneyId,userId,cb) {
	var conn = redis.get('persistent', 'rw'),
		key = userInspectKey(tourneyId,userId);
	conn.set(key, constants._INSPECT_COUNT, cb);
};



module.exports = PowerModel;
