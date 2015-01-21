var _ = require('lodash'),
	async = require('async'),
	mysql = require('../persistence').mysql;

var GamesModel = {};

GamesModel.insertGameResult = function(options, cb) {
	var sql = 'INSERT INTO `games` (winningPlayerId, winningCharacterId, losingPlayerId, losingCharacterId, tournamentId, value) VALUES(?,?,?,?,?,?)',
		params = [options.winPid, options.winXid, options.losePid, options.loseXid, options.tourneyId, options.value];

	mysql.query('rw', sql, params, 'modules/games/games-model/insertGameResult', function(err, results){
		if(err)return cb(err);
		return cb(null,results.insertId)
	});
};

GamesModel.iceDown = function(uid,icedCid,cb) {
	var sql = 'UPDATE charactersData SET value = value - 1 WHERE userId = ? AND characterId != ? AND value > 1',
		params = [uid, icedCid];

	mysql.query('rw', sql, params, 'modules/games/games-model/iceDown', function(err, results){
		return cb(err, results);
	});
};

GamesModel.fireUp = function(uid,fireCid,cb) {
	var sql = 'UPDATE charactersData SET value = value + 1 WHERE userId = ? AND characterId != ?',
		params = [uid, fireCid];

	mysql.query('rw', sql, params, 'modules/games/games-model/fireUp', function(err, results){
		return cb(err, results);
	});
};

GamesModel.incWinCharCurStreak = function(uid,cid,cb) {
	var sql = 'UPDATE charactersData SET curStreak = CASE WHEN curStreak < 1 THEN 1 ELSE curStreak +1 END WHERE userId = ? AND characterId = ?',
		params = [uid,cid];

	mysql.query('rw', sql, params, 'modules/games/games-model/incWinCharCurStreak', function(err, results){
		return cb(err,results)
	});
};

GamesModel.resetLoseCharCurStreak = function(uid,cid,cb) {
	var sql = 'UPDATE charactersData SET curStreak = CASE WHEN curStreak > 0 THEN -1 ELSE curStreak -1 END WHERE userId = ? AND characterId = ?',
		params = [uid,cid];

	mysql.query('rw', sql, params, 'modules/games/games-model/resetLoseCharCurStreak', function(err, results){
		return cb(err,results)
	});
};

GamesModel.decWinCharValue = function(uid,cid,cb) {
	var sql = 'UPDATE charactersData SET value = value-1 WHERE userId = ? AND characterId = ? AND value > 1',
		params = [uid,cid];

	mysql.query('rw', sql, params, 'modules/games/games-model/decWinCharValue', function(err, results){
		return cb(err,results)
	});
};

GamesModel.incLoseCharValue = function(uid,cid,cb) {
	var sql = 'UPDATE charactersData SET value = value+1 WHERE userId = ? AND characterId = ?',
		params = [uid,cid];

	mysql.query('rw', sql, params, 'modules/games/games-model/incLoseCharValue', function(err, results){
		return cb(err,results)
	});
};

GamesModel.calculateCurStreak = function(options, cb) {
	var sql = 'INSERT INTO `games` (winningPlayerId, winningCharacterId, losingPlayerId, losingCharacterId, tournamentId, value) VALUES(?,?,?,?,?,?)',
		params = [options.winPid, options.winXid, options.losePid, options.loseXid, options.tourneyId, options.value];

	mysql.query('rw', sql, params, 'modules/games/games-model/calculateCurStreak', function(err, results){
		if(err)return cb(err);
		return cb(null,results.insertId)
	});
};

module.exports = GamesModel;
