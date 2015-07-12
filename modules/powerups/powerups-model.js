var _ = require('lodash'),
	async = require('async'),
	constants = require('../constants'),
	redis = require('../persistence').redis,
	historyMdl = require('../history/history-model');

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
	conn.get(key, function(err,stock){
		if(err) return cb(err);
		return cb(null,parseInt(stock,10));
	});
};
PowerModel.setUserStock = function(tourneyId,userId,cb) {
	var conn = redis.get('persistent', 'rw'),
		key = userStockKey(tourneyId,userId);

	conn.set(key, constants._STARTING_PWR_STOCK, function(err,results){
		if(err) return cb(err);

		//Add to history
		historyMdl.recordEvent({
			tid: tourneyId,
			uid: userId,
			eventString: 'power-init',
			value: constants._STARTING_PWR_STOCK,
			delta: constants._STARTING_PWR_STOCK
		},cb);
	});
};
PowerModel.incrUserStock = function(tourneyId,userId,cb) {
	var conn = redis.get('persistent', 'rw'),
		key = userStockKey(tourneyId,userId);
	conn.incr(key, function(err,result){
		return cb(err, parseInt(result,10));
	});
};
PowerModel.decrUserStock = function(tourneyId,userId,cb) {
	var conn = redis.get('persistent', 'rw'),
		key = userStockKey(tourneyId,userId);
	conn.decr(key, function(err,result){
		return cb(err, parseInt(result,10));
	});
};

/*
	inspect
*/
PowerModel.getInspectStatus = function(tourneyId,cb) {
	var conn = redis.get('persistent', 'rw'),
		key = inspectStatusKey(tourneyId);
	conn.get(key, cb);
};
// general locking functionality around inspect.
PowerModel.setnxInspectStatus = function(tourneyId,userId,cb) {
	var conn = redis.get('persistent', 'rw'),
		key = inspectStatusKey(tourneyId);
	conn.setnx(key, userId, cb);
};
// only for overriding someone else's power at remaining = 0
PowerModel.setInspectStatus = function(tourneyId,userId,cb) {
	var conn = redis.get('persistent', 'rw'),
		key = inspectStatusKey(tourneyId);
	conn.set(key, userId, cb);
};
PowerModel.clearInspectStatus = function(tourneyId,cb){
	var conn = redis.get('persistent','rw'),
		key = inspectStatusKey(tourneyId);
	conn.del(key,cb);
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
// for undo games
PowerModel.incrUserInspect = function(tourneyId,userId,cb) {
	var conn = redis.get('persistent', 'rw'),
		key = userInspectKey(tourneyId,userId);
	conn.incr(key, cb);
};
PowerModel.setUserInspect = function(tourneyId,userId,cb) {
	var conn = redis.get('persistent', 'rw'),
		key = userInspectKey(tourneyId,userId);
	conn.set(key, constants._INSPECT_COUNT, cb);
};

module.exports = PowerModel;
