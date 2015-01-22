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
	var sql = 'UPDATE tournaments SET championId = ? WHERE id = ?',
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
	var sql = 'SELECT id FROM tournaments WHERE name = ?',
		params = [tourneyName];

	mysql.query('rw', sql, params, 'modules/tournaments/tournaments-model/getTourneyId', function(err, results){
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

module.exports = TournamentsModel;
