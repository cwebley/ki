var _ = require('lodash'),
	async = require('async'),
	mysql = require('../persistence').mysql;

var TournamentsModel = {};

TournamentsModel.createTournament = function(options, cb) {
	var sql = 'INSERT INTO `tournaments` (name, goal) VALUE(?,?)',
		params = [options.name, options.goal];

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


module.exports = TournamentsModel;
