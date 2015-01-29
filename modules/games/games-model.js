var _ = require('lodash'),
	async = require('async'),
	mysql = require('../persistence').mysql;

var GamesModel = {};

GamesModel.insertGameResult = function(options, cb) {

	// games
	var sql = 'INSERT INTO `games` (winningPlayerId, winningCharacterId, losingPlayerId, losingCharacterId, tournamentId, value, supreme) VALUES(?,?,?,?,?,?,?)',
		params = [options.winPid, options.winXid, options.losePid, options.loseXid, options.tourneyId, options.winValue, options.supreme];

	mysql.query('rw', sql, params, 'modules/games/games-model/insertGameResult:games', function(err, results){
		if(err)return cb(err);
		if(!results.insertId)return cb();

		// get game event for history update, just for thoroughness and in case the events table changes.
		sql = 'SELECT id FROM events WHERE description = ?'
		params = ['game'];

		mysql.query('rw', sql, params, 'modules/games/games-model/insertGameResult:getEvent', function(err, results){
			if(err) return cb(err)
			if(!results || !results.length) return cb(new Error('event-id-not-found-for-seeding-event'))
			var eventId = results[0].id

			//history: winner and loser
			sql = 'INSERT INTO history (tournamentId,userId,characterId,eventId,value,delta)'
			+ ' VALUES(?,?,?,?,?,?),(?,?,?,?,?,?)'
			params = [options.tourneyId,options.winPid,options.winXid,eventId,options.winValue,-1,options.tourneyId,options.losePid,options.loseXid,eventId,options.loseValue,+1];
	
			mysql.query('rw', sql, params, 'modules/games/games-model/insertGameResult:history', cb)
		});
	});
};

GamesModel.iceDown = function(tid,uid,icedCid,cb) {
	var sql = 'UPDATE tournamentCharacters SET value = value - 1 WHERE tournamentId = ? AND userId = ? AND characterId != ? AND value > 1',
		params = [tid, uid, icedCid];

	mysql.query('rw', sql, params, 'modules/games/games-model/iceDown', function(err, results){
		return cb(err, results);
	});
};

GamesModel.fireUp = function(tid,uid,fireCid,cb) {
	var sql = 'UPDATE tournamentCharacters SET value = value + 1 WHERE tournamentId = ? AND userId = ? AND characterId != ?',
		params = [tid, uid, fireCid];

	mysql.query('rw', sql, params, 'modules/games/games-model/fireUp', function(err, results){
		return cb(err, results);
	});
};

GamesModel.incWinCharCurStreak = function(tid,uid,cid,cb) {
	var sql = 'UPDATE tournamentCharacters SET curStreak = CASE WHEN curStreak < 1 THEN 1 ELSE curStreak +1 END'
			+', bestStreak = CASE WHEN curStreak > bestStreak THEN curStreak ELSE bestStreak END'
			+' WHERE tournamentId = ? AND userId = ? AND characterId = ?',
		params = [tid,uid,cid];

	mysql.query('rw', sql, params, 'modules/games/games-model/incWinCharCurStreak', function(err, results){
		return cb(err,results)
	});
};

GamesModel.resetLoseCharCurStreak = function(tid,uid,cid,cb) {
	var sql = 'UPDATE tournamentCharacters SET curStreak = CASE WHEN curStreak > 0 THEN -1 ELSE curStreak -1 END WHERE tournamentId = ? AND userId = ? AND characterId = ?',
		params = [tid,uid,cid];

	mysql.query('rw', sql, params, 'modules/games/games-model/resetLoseCharCurStreak', function(err, results){
		return cb(err,results)
	});
};

GamesModel.decWinCharValue = function(tid,uid,cid,cb) {
	var sql = 'UPDATE tournamentCharacters SET value = value-1 WHERE tournamentId = ? AND userId = ? AND characterId = ? AND value > 1',
		params = [tid,uid,cid];

	mysql.query('rw', sql, params, 'modules/games/games-model/decWinCharValue', function(err, results){
		return cb(err,results)
	});
};

GamesModel.incLoseCharValue = function(tid,uid,cid,cb) {
	var sql = 'UPDATE tournamentCharacters SET value = value+1 WHERE tournamentId = ? AND userId = ? AND characterId = ?',
		params = [tid,uid,cid];

	mysql.query('rw', sql, params, 'modules/games/games-model/incLoseCharValue', function(err, results){
		return cb(err,results)
	});
};

GamesModel.incWinUsersStreak = function(tid,uid,cb) {
	var sql = 'UPDATE tournamentUsers SET curStreak = CASE WHEN curStreak < 0 THEN 1 ELSE curStreak+1 END'
			+ ', bestStreak = CASE WHEN curStreak > bestStreak THEN curStreak ELSE bestStreak END'
			+' WHERE tournamentId = ? AND userId = ?',
		params = [tid,uid];

	mysql.query('rw', sql, params, 'modules/games/games-model/incWinUsersStreak', function(err, results){
		return cb(err,results)
	});
};

GamesModel.decLossUsersStreak = function(tid,uid,cb) {
	var sql = 'UPDATE tournamentUsers SET curStreak = CASE WHEN curStreak > 0 THEN -1 ELSE curStreak-1 END'
		+ ' WHERE tournamentId = ? AND userId = ?',
		params = [tid,uid];

	mysql.query('rw', sql, params, 'modules/games/games-model/decLossUsersStreak', function(err, results){
		return cb(err,results)
	});
};

GamesModel.incWinUsersGames = function(tid,uid,cb) {
	var sql = 'UPDATE tournamentUsers SET wins = wins + 1 WHERE tournamentId = ? AND userId = ?',
		params = [tid,uid];

	mysql.query('rw', sql, params, 'modules/games/games-model/decLossUsersStreak', function(err, results){
		return cb(err,results)
	});
};

GamesModel.decLossUsersGames = function(tid,uid,cb) {
	var sql = 'UPDATE tournamentUsers SET losses = losses + 1 WHERE tournamentId = ? AND userId = ?',
		params = [tid,uid];

	mysql.query('rw', sql, params, 'modules/games/games-model/decLossUsersStreak', function(err, results){
		return cb(err,results)
	});
};

GamesModel.incWinCharWins = function(tid,uid,cid,cb) {
	var sql = 'UPDATE tournamentCharacters SET wins = wins + 1 WHERE tournamentId = ? AND userId = ? AND characterId = ?',
		params = [tid,uid,cid];

	mysql.query('rw', sql, params, 'modules/games/games-model/incWinCharWins', function(err, results){
		return cb(err,results)
	});
};

GamesModel.incLoseCharLosses = function(tid,uid,cid,cb) {
	var sql = 'UPDATE tournamentCharacters SET losses = losses + 1 WHERE tournamentId = ? AND userId = ? AND characterId = ?',
		params = [tid,uid,cid];

	mysql.query('rw', sql, params, 'modules/games/games-model/incLoseCharLosses', function(err, results){
		return cb(err,results)
	});
};

GamesModel.updateWinnerScore = function(tid,uid,value,cb) {
	var sql = 'UPDATE tournamentUsers SET score = score + ? WHERE tournamentId = ? AND userId = ?',
		params = [value,tid,uid];

	mysql.query('rw', sql, params, 'modules/games/games-model/updateWinnerScore', function(err, results){
		return cb(err,results)
	});
};

// tid: integer tournamentId
GamesModel.getTournamentScores = function(tid,cb) {
	var sql = 'SELECT u.id userId, u.name, tu.score, t.goal FROM tournaments t'
			+ ' JOIN tournamentUsers tu ON tu.tournamentId = t.id'
			+ ' JOIN users u ON u.id = tu.userId'
			+ ' WHERE t.id = ?' 
			+ ' ORDER BY tu.score DESC',
		params = [tid];

	mysql.query('rw', sql, params, 'modules/games/games-model/getTournamentScores', function(err, results){
		return cb(err,results)
	});
};

module.exports = GamesModel;
