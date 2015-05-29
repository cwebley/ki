var _ = require('lodash'),
	async = require('async'),
	mysql = require('../persistence').mysql;

var TournamentsModel = {};

//options: object {goal:100,name:"test tourney"}
TournamentsModel.createTournament = function(options,cb) {
	var sql = 'INSERT INTO `tournaments` (name,goal) VALUES(?,?)',
		params = [options.name, options.goal];

	mysql.query('rw', sql, params, 'modules/tournaments/tournaments-model/createTournament', function(err, results){
		if(err) return cb(err);
		return cb(null, results.insertId);
	});
};

TournamentsModel.checkTournamentExists = function(options,cb) {
	var sql = 'SELECT id FROM `tournaments` WHERE name = ?',
		params = [options.name];

	mysql.query('rw', sql, params, 'modules/tournaments/tournaments-model/checkTournamentExists', function(err, results){
		if(err) return cb(err);
		if(!results || !results.length) return cb()
		return cb(null, results);
	});
};

TournamentsModel.recordChampion = function(tid,uid,cb) {
	var sql = 'UPDATE tournaments SET championId = ?, active = 0 WHERE id = ?',
		params = [uid,tid];

	mysql.query('rw', sql, params, 'modules/tournaments/tournaments-model/recordChampion', function(err, results){
		return cb(err,results)
	});
};

TournamentsModel.getTourneyId = function(tourneyName, cb) {
	var sql = 'SELECT id, seeded FROM tournaments WHERE name = ?',
		params = [tourneyName];

	mysql.query('rw', sql, params, 'modules/tournaments/tournaments-model/getTourneyId', function(err, results){
		if(err) return cb(err)
		if(!results || !results.length) return cb()
		return cb(null, results[0].id, results[0].seeded);
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

	mysql.query('rw', sql, params, 'modules/tournaments/tournaments-model/getPlayers', function(err, results){
		return cb(err,results)
	});
};

TournamentsModel.getPlayers = function(tourneyName, cb) {
	var sql = 'SELECT tu.userId FROM tournamentUsers tu JOIN tournaments t ON t.id = tu.tournamentId WHERE t.name = ?'
		params = [tourneyName];

	mysql.query('rw', sql, params, 'modules/tournaments/tournaments-model/getPlayers', function(err, results){
		if (err) return cb(err)
		return cb(null,_.pluck(results, 'userId'))
	});
};

TournamentsModel.getPlayersNamesIds = function(tourneyName, cb) {
	var sql = 'SELECT u.id,u.name FROM users u'
		+ ' JOIN tournamentUsers tu ON u.id = tu.userId'
		+ ' JOIN tournaments t ON t.id = tu.tournamentId WHERE t.name = ?'
		params = [tourneyName];

	mysql.query('rw', sql, params, 'modules/tournaments/tournaments-model/getPlayersNamesIds', function(err, results){
		if (err) return cb(err)
		return cb(null,results)
	});
};

TournamentsModel.getStats = function(tourneyName, cb) {
	var sql = 'SELECT u.name,tu.score,tu.wins,tu.losses,tu.curStreak FROM users u'
			+ ' JOIN tournamentUsers tu ON tu.userId = u.id'
			+ ' JOIN tournaments t ON t.id = tu.tournamentId'
			+ ' WHERE t.name = ?'
			+ ' ORDER BY tu.score DESC'
		params = [tourneyName];

	mysql.query('rw', sql, params, 'modules/tournaments/tournaments-model/getStats', function(err, results){
		if (err) return cb(err)
		return cb(null,results)
	});
};

TournamentsModel.getCharacterStats = function(tourneyName, userName, cb) {
	var sql = 'SELECT c.name,tc.value,tc.curStreak,tc.wins,tc.losses FROM characters c'
			+ ' JOIN tournamentCharacters tc ON tc.characterId = c.id'
			+ ' JOIN tournaments t ON t.id = tc.tournamentId'
			+ ' JOIN users u ON u.id = tc.userId'
			+ ' WHERE u.name = ? AND t.name = ?'
			+ ' ORDER BY tc.curStreak DESC,tc.value DESC'
		params = [userName, tourneyName];

	mysql.query('rw', sql, params, 'modules/tournaments/tournaments-model/getCharacterStats', function(err, results){
		if (err) return cb(err)
		return cb(null,results)
	});
};

TournamentsModel.getTourneyList = function(cb) {
	var sql = 'SELECT t.id, t.name, t.goal, t.active, t.time, u.name champion FROM tournaments t LEFT JOIN users u ON t.championId = u.id'

	mysql.query('rw', sql, [], 'modules/tournaments/tournaments-model/getTourneyList', function(err, results){
		if(err) return cb(err)
		return cb(null,results);
	});
};

TournamentsModel.getTourneyInfo = function(name,cb) {
	var sql = 'SELECT name, goal FROM tournaments WHERE name = ?',
		params = [name]

	mysql.query('rw', sql, params, 'modules/tournaments/tournaments-model/getTourneyInfo', function(err, results){
		if(err) return cb(err)
		return cb(null,results);
	});
};

TournamentsModel.editTournament = function(name,goal,oldName,cb) {
	var sql = 'UPDATE tournaments SET name = ?, active = 1, goal = ? WHERE name = ?',
		params = [name, goal, oldName]

	mysql.query('rw', sql, params, 'modules/tournaments/tournaments-model/editTournament', function(err, results){
		if(err) return cb(err)
		return cb(null,results);
	});
};

TournamentsModel.updateSeedStatus = function(tourneyName,cb) {
	var sql = 'SELECT tu.seeded, u.name FROM tournamentUsers tu'
			+ ' JOIN users u ON u.id = tu.userId'
			+ ' JOIN tournaments t ON t.id = tu.tournamentId'
			+ ' WHERE t.name = ?',
		params = [tourneyName]

	mysql.query('rw', sql, params, 'modules/tournaments/tournaments-model/updateSeedStatus', function(err, results){
		if(err) return cb(err)
		return cb(null,results);
	});
};

module.exports = TournamentsModel;
