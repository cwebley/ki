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
var rematchKey = function(tourneyId) {
	return tourneyId + ':rematch'
};
var streakPointsKey = function(tourneyId,userId) {
	return tourneyId + ':' + userId + ':streakPoints'
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
			eventString: 'power-stock-init',
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

// rematches can only be used once per game, and not back to back
PowerModel.setnxRematchStatus = function(tourneyId,cb) {
	var conn = redis.get('persistent', 'rw'),
		key = rematchKey(tourneyId);
	conn.setnx(key, 2, function(err,result){
		if(err) return cb(err);
		return cb(null, parseInt(result,10));
	});
};

PowerModel.decrRematchStatus = function(tourneyId,cb) {
	var conn = redis.get('persistent', 'rw'),
		key = rematchKey(tourneyId);
	conn.decr(key, function(err,result){
		return cb(err,parseInt(result,10));
	});
};
PowerModel.delRematchStatus = function(tourneyId,cb) {
	var conn = redis.get('persistent', 'rw'),
		key = rematchKey(tourneyId);
	conn.del(key, cb);
};
PowerModel.getRematchStatus = function(tourneyId,cb) {
	var conn = redis.get('persistent', 'rw'),
		key = rematchKey(tourneyId);
	conn.get(key, function(err,result){
		if(err) return cb(err);
		if(!result){
			return cb();
		}
		return cb(null, parseInt(result,10));
	});
};

/* Streak Points */
PowerModel.getStreakPoints = function(tourneyId,userId,cb) {
	var conn = redis.get('persistent', 'rw'),
		key = streakPointsKey(tourneyId,userId);
	conn.get(key, function(err,result){
		if(err) return cb(err);
		if(!result) return cb(null, 0);
		return cb(null, parseInt(result,10));
	});
};
PowerModel.incrStreakPoints = function(tourneyId,userId,interval,cb) {
	var conn = redis.get('persistent', 'rw'),
		key = streakPointsKey(tourneyId,userId);
	conn.incrby(key, interval, function(err,result){
		if(err) return cb(err);
		return cb(null, parseInt(result,10));
	});
};
PowerModel.decrStreakPoints = function(tourneyId,userId,interval,cb) {
	var conn = redis.get('persistent', 'rw'),
		key = streakPointsKey(tourneyId,userId);
	conn.decrby(key, interval, function(err,result){
		if(err) return cb(err);
		return cb(null, parseInt(result,10));
	});
};

module.exports = PowerModel;
