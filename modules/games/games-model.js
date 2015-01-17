var _ = require('lodash'),
	async = require('async'),
	mysql = require('../persistence').mysql;

var GamesModel = {};

GamesModel.insertGameResult = function(options, cb) {
	var sql = 'INSERT INTO `games` (winningPlayerId, winningCharacterId, losingPlayerId, losingCharacterId, tournamentId) VALUES(?,?,?,?,?)',
		params = [options.winPid, options.winXid, options.losePid, options.loseXid, options.tourneyId];

	mysql.query('rw', sql, params, 'modules/games/games-model/insertGameResult', function(err, results){
		return cb(err, results);
	});
};

GamesModel.createTournament = function(options, cb) {
	var sql = 'INSERT INTO `tournaments` (name, goal) VALUE(?,?)',
		params = [options.name, options.goal];

	mysql.query('rw', sql, params, 'modules/games/games-model/createTournament', function(err, results){
		return cb(err, results);
	});
};

GamesModel.getTourneyId = function(tourneyName, cb) {
	var sql = 'SELECT id FROM tournaments WHERE name = ?',
		params = [tourneyName];

	mysql.query('rw', sql, params, 'modules/games/games-model/getTourneyId', function(err, results){
		if(err) return cb(err)
		if(!results || !results.length) return cb()
		return cb(null, results[0].id);
	});
};


module.exports = GamesModel;
