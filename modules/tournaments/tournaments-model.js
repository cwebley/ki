var _ = require('lodash'),
	async = require('async'),
	mysql = require('../persistence').mysql;

var TournamentsModel = {};

//options: object {goal:100,name:"test tourney"}
//players: array of userIds [1,2]
TournamentsModel.createTournament = function(options,players,cb) {
	if(!players.length || players.length !== 2) return cb()
	var sql = 'INSERT INTO `tournaments` (name,goal,user1Id,user2Id) VALUE(?,?,?,?)',
		params = [options.name, options.goal,players[0],players[0]];

	mysql.query('rw', sql, params, 'modules/games/games-model/createTournament', function(err, results){
		if(err) return cb(err);
		return cb(null, results.insertId);
	});
};

TournamentsModel.getTourneyId = function(tourneyName, cb) {
	var sql = 'SELECT id FROM tournaments WHERE name = ?',
		params = [tourneyName];

	mysql.query('rw', sql, params, 'modules/games/games-model/getTourneyId', function(err, results){
		if(err) return cb(err)
		if(!results || !results.length) return cb()
		return cb(null, results[0].id);
	});
};

TournamentsModel.getPlayers = function(tourneyName, cb) {
	var sql = 'SELECT user1Id,user2Id FROM tournaments WHERE name = ?'
		params = [tourneyName];

	mysql.query('rw', sql, params, 'modules/games/games-model/getPlayers', function(err, results){
		return cb(err,results)
	});
};


module.exports = TournamentsModel;
