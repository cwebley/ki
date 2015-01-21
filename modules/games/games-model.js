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

GamesModel.incWinUsersStreak = function(uid,cb) {
	var sql = 'UPDATE users SET curStreak = CASE WHEN curStreak < 0  THEN 1 ELSE curStreak+1 END WHERE id = ?',
		params = [uid];

	mysql.query('rw', sql, params, 'modules/games/games-model/incWinUsersStreak', function(err, results){
		return cb(err,results)
	});
};

GamesModel.decLossUsersStreak = function(uid,cb) {
	var sql = 'UPDATE users SET curStreak = CASE WHEN curStreak > 0 THEN -1 ELSE curStreak-1 END WHERE id = ?',
		params = [uid];

	mysql.query('rw', sql, params, 'modules/games/games-model/decLossUsersStreak', function(err, results){
		return cb(err,results)
	});
};

GamesModel.updateWinnerScore = function(uid,value,cb) {
	var sql = 'UPDATE users SET score = score + ? WHERE id = ?',
		params = [value,uid];

	mysql.query('rw', sql, params, 'modules/games/games-model/updateWinnerScore', function(err, results){
		return cb(err,results)
	});
};

// tid: integer tournamentId
GamesModel.getTournamentScores = function(tid,cb) {
	var sql = 'SELECT u.name, u.score, t.goal FROM tournaments t'
			+ ' JOIN tournamentUsers tu ON tu.tournamentId = t.id'
			+ ' JOIN users u ON u.id = tu.userId'
			+ ' WHERE t.id = ? ',
		params = [tid];

	mysql.query('rw', sql, params, 'modules/games/games-model/updateWinnerScore', function(err, results){
		return cb(err,results)
	});
};

module.exports = GamesModel;
