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

TournamentsModel.recordChampion = function(tid,uid,cb) {
	var sql = 'UPDATE tournaments SET championId = ?, active = 0 WHERE id = ?',
		params = [uid,tid];

	mysql.query('rw', sql, params, 'modules/tournaments/tournaments-model/recordChampion', function(err, results){
		return cb(err,results)
	});
};

TournamentsModel.recordFinalScore = function(tid,uid,score,cb) {
	var sql = 'UPDATE tournamentUsers SET finalScore = ? WHERE tournamentId = ? AND userId = ?',
		params = [score,tid,uid];

	mysql.query('rw', sql, params, 'modules/tournaments/tournaments-model/recordFinalScores', function(err, results){
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

TournamentsModel.getStats = function(tourneyName, cb) {
	var sql = 'SELECT u.name,u.score,u.name,u.gameWins,u.gameLosses,u.curStreak FROM users u'
			+ ' JOIN tournamentUsers tu ON tu.userId = u.id'
			+ ' JOIN tournaments t ON t.id = tu.tournamentId'
			+ ' WHERE t.name = ?'
			+ ' ORDER BY u.score DESC'
		params = [tourneyName];

	mysql.query('rw', sql, params, 'modules/tournaments/tournaments-model/getStats', function(err, results){
		if (err) return cb(err)
		return cb(null,results)
	});
};

TournamentsModel.getCharacterStats = function(userName, cb) {
	var sql = 'SELECT c.name,cd.value,cd.curStreak FROM characters c'
			+ ' JOIN charactersData cd ON cd.characterId = c.id'
			+ ' JOIN users u ON u.id = cd.userId'
			+ ' WHERE u.name = ?'
			+ ' ORDER BY cd.value ASC'
		params = [userName];

	mysql.query('rw', sql, params, 'modules/tournaments/tournaments-model/getCharacterStats', function(err, results){
		if (err) return cb(err)
		return cb(null,results)
	});
};

TournamentsModel.getTourneyList = function(cb) {
	var sql = 'SELECT t.name tournamentName, t.goal, t.active, t.time, u.name champion FROM tournaments t LEFT JOIN users u ON t.championId = u.id'

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
