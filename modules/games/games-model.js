var _ = require('lodash'),
	async = require('async'),
	mysql = require('../persistence').mysql;

var GamesModel = {};

GamesModel.insertGameResult = function(options, cb) {
	console.log("IGR: ", options)
	var sql = 'INSERT INTO `games` (winningPlayerId, winningCharacterId, losingPlayerId, losingCharacterId, tournamentId, value) VALUES(?,?,?,?,?,?)',
		params = [options.winPid, options.winXid, options.losePid, options.loseXid, options.tourneyId, options.value];

	mysql.query('rw', sql, params, 'modules/games/games-model/insertGameResult', function(err, results){
		return cb(err, results);
	});
};

GamesModel.createTournament = function(options, cb) {
	var sql = 'INSERT INTO `tournaments` (name, goal) VALUE(?,?)',
		params = [options.name, options.goal];

	mysql.query('rw', sql, params, 'modules/games/games-model/createTournament', function(err, results){
		if(err) return cb(err);
		return cb(null, results.insertId);
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
