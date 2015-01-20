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

module.exports = GamesModel;
