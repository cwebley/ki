var _ = require('lodash'),
	async = require('async'),
	mysql = require('../persistence').mysql;

var TournamentsModel = {};

//options: object {goal:100,name:"test tourney"}
TournamentsModel.createTournament = function(options,cb) {
	var sql = 'INSERT INTO `tournaments` (name,goal) VALUES(?,?)',
		params = [options.name, options.goal];

	mysql.query('rw', sql, params, 'modules/games/tournaments-model/createTournament', function(err, results){
		if(err) return cb(err);
		return cb(null, results.insertId);
	});
};

TournamentsModel.getTourneyId = function(tourneyName, cb) {
	var sql = 'SELECT id FROM tournaments WHERE name = ?',
		params = [tourneyName];

	mysql.query('rw', sql, params, 'modules/games/tournaments-model/getTourneyId', function(err, results){
		if(err) return cb(err)
		if(!results || !results.length) return cb()
		return cb(null, results[0].id);
	});
};

//tid: integer, tournamentId
//userIds: array of userIds [1,2,3,4]
TournamentsModel.insertPlayers = function(tid, userIds, cb) {
	if(!userIds.length  || userIds.length < 2){
		var err = new Error('modules/tournaments-model/insertPlayers:no-userIds-array-of-min-len-2')
		return cb(err)
	}

	var sql = 'INSERT INTO tournamentUsers (tournamentId, userId) VALUES (?,?)'
		params = [];

	for(var i=0;i<userIds.length;i++){
		if(i< userIds.length-1){
			sql += ',(?,?)'
		}
		params.push(tid)
		params.push(userIds[i])
	}

	mysql.query('rw', sql, params, 'modules/games/tournaments-model/getPlayers', function(err, results){
		return cb(err,results)
	});
};

TournamentsModel.getPlayers = function(tourneyName, cb) {
	var sql = 'SELECT userId FROM tournamentUsers tu JOIN tournaments t ON t.id = tu.tournamentId WHERE t.name = ?'
		params = [tourneyName];

	mysql.query('rw', sql, params, 'modules/games/tournaments-model/getPlayers', function(err, results){
		if (err) return cb(err)
		return cb(null,_.pluck(results, 'userId'))
	});
};


module.exports = TournamentsModel;
