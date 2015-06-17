var _ = require('lodash'),
	async = require('async'),
	mysql = require('../persistence').mysql;

var TournamentsModel = {};

//options: object {goal:100,name:"test tourney"}
TournamentsModel.createTournament = function(options,cb) {
	var sql = 'INSERT INTO `tournaments` (name,slug,goal) VALUES(?,?,?)',
		params = [options.name, options.slug, options.goal];

	mysql.query('rw', sql, params, 'modules/tournaments/tournaments-model/createTournament', function(err, results){
		if(err) return cb(err);
		return cb(null, results.insertId);
	});
};

// TODO delete wins from users, characters, etc
TournamentsModel.deleteTournament = function(tid,cb) {
	var sql = 'DELETE FROM history where tournamentId = ?',
		params = [tid];

	mysql.query('rw', sql, params, 'modules/tournaments/tournaments-model/deleteTournament-history', function(err, results){
		if(err) return cb(err);

		var sql = 'DELETE FROM seeds where tournamentId = ?',
			params = [tid];

		mysql.query('rw', sql, params, 'modules/tournaments/tournaments-model/deleteTournament-seeds', function(err, results){
			if(err) return cb(err);

			var sql = 'DELETE FROM tournamentCharacters where tournamentId = ?',
				params = [tid];

			mysql.query('rw', sql, params, 'modules/tournaments/tournaments-model/deleteTournament-tournamentCharacters', function(err, results){
				if(err) return cb(err);

				var sql = 'DELETE FROM tournamentPowers where tournamentId = ?',
					params = [tid];
	
				mysql.query('rw', sql, params, 'modules/tournaments/tournaments-model/deleteTournament-tournamentPowers', function(err, results){
					if(err) return cb(err);

					var sql = 'DELETE FROM tournamentUsers where tournamentId = ?',
						params = [tid];

					mysql.query('rw', sql, params, 'modules/tournaments/tournaments-model/deleteTournament-tournamentUsers', function(err, results){
						if(err) return cb(err);

						var sql = 'DELETE FROM games where tournamentId = ?',
							params = [tid];

						mysql.query('rw', sql, params, 'modules/tournaments/tournaments-model/deleteTournament-tournamentUsers', function(err, results){
							if(err) return cb(err);

							var sql = 'DELETE FROM tournaments where id = ?',
								params = [tid];
	
							mysql.query('rw', sql, params, 'modules/tournaments/tournaments-model/deleteTournament-tournaments', function(err, results){
								if(err) return cb(err);
								return cb(null, results)
							});
						});
					});
				});
			});
		});
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

TournamentsModel.getTourneyId = function(tourneySlug, cb) {
	var sql = 'SELECT id, seeded FROM tournaments WHERE slug = ?',
		params = [tourneySlug];

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

	mysql.query('rw', sql, params, 'modules/tournaments/tournaments-model/insertPlayers', function(err, results){
		return cb(err,results)
	});
};

TournamentsModel.getPlayers = function(tourneySlug, cb) {
	var sql = 'SELECT tu.userId FROM tournamentUsers tu JOIN tournaments t ON t.id = tu.tournamentId WHERE t.slug = ?'
		params = [tourneySlug];

	mysql.query('rw', sql, params, 'modules/tournaments/tournaments-model/getPlayers', function(err, results){
		if (err) return cb(err)
		return cb(null,_.pluck(results, 'userId'))
	});
};

TournamentsModel.getPlayersNamesIds = function(tourneySlug, cb) {
	var sql = 'SELECT u.id,u.name FROM users u'
		+ ' JOIN tournamentUsers tu ON u.id = tu.userId'
		+ ' JOIN tournaments t ON t.id = tu.tournamentId WHERE t.slug = ?'
		params = [tourneySlug];

	mysql.query('rw', sql, params, 'modules/tournaments/tournaments-model/getPlayersNamesIds', function(err, results){
		if (err) return cb(err)
		return cb(null,results)
	});
};

TournamentsModel.getStats = function(tourneySlug, cb) {
	var sql = 'SELECT u.name,tu.score,tu.seeded,tu.wins,tu.losses,tu.curStreak FROM users u'
			+ ' JOIN tournamentUsers tu ON tu.userId = u.id'
			+ ' JOIN tournaments t ON t.id = tu.tournamentId'
			+ ' WHERE t.slug = ?'
			+ ' ORDER BY u.name'
		params = [tourneySlug];

	mysql.query('rw', sql, params, 'modules/tournaments/tournaments-model/getStats', function(err, results){
		if (err) return cb(err)
		return cb(null,results)
	});
};

TournamentsModel.getCharacterStats = function(tourneySlug, userName, cb) {
	var sql = 'SELECT c.id,c.name,tc.value,tc.curStreak,tc.wins,tc.losses FROM characters c'
			+ ' JOIN tournamentCharacters tc ON tc.characterId = c.id'
			+ ' JOIN tournaments t ON t.id = tc.tournamentId'
			+ ' JOIN users u ON u.id = tc.userId'
			+ ' WHERE u.name = ? AND t.slug = ?'
			+ ' ORDER BY tc.curStreak DESC,tc.value DESC'
		params = [userName, tourneySlug];

	mysql.query('rw', sql, params, 'modules/tournaments/tournaments-model/getCharacterStats', function(err, results){
		if (err) return cb(err)
		return cb(null,results)
	});
};

TournamentsModel.getTourneyList = function(cb) {
	var sql = 'SELECT t.id, t.name, t.slug, t.goal, t.active, t.time, u.name champion FROM tournaments t LEFT JOIN users u ON t.championId = u.id'

	mysql.query('rw', sql, [], 'modules/tournaments/tournaments-model/getTourneyList', function(err, results){
		if(err) return cb(err)
		return cb(null,results);
	});
};

TournamentsModel.getTourneyInfo = function(slug,cb) {
	var sql = 'SELECT name, slug, goal FROM tournaments WHERE slug = ?',
		params = [slug]

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

TournamentsModel.updateSeedStatus = function(tourneySlug,cb) {
	var sql = 'SELECT tu.seeded, u.name FROM tournamentUsers tu'
			+ ' JOIN users u ON u.id = tu.userId'
			+ ' JOIN tournaments t ON t.id = tu.tournamentId'
			+ ' WHERE t.slug = ?',
		params = [tourneySlug];

	mysql.query('rw', sql, params, 'modules/tournaments/tournaments-model/updateSeedStatus', function(err, results){
		if(err) return cb(err);
		return cb(null,results);
	});
};

TournamentsModel.getPrevious = function(tourneyId,cb) {
	var sql = 'SELECT id, name, slug FROM tournaments WHERE seeded = 1 AND id < ? ORDER BY id DESC LIMIT 1',
		params = [tourneyId];

	mysql.query('rw', sql, params, 'modules/tournaments/tournaments-model/getPreviousAndSeeds', function(err, results){
		if(err) return cb(err);
		if(!results.length) return cb();
		return cb(null,results[0]);
	});
};

TournamentsModel.getSeeds = function(tourneyId,userId,cb) {
	var sql = 'SELECT c.name, h.characterId, h.value, tc.wins, tc.losses, tc.bestStreak'
			+ ' FROM history h'
			+ ' JOIN characters c ON c.id = h.characterId'
			+ ' JOIN tournamentCharacters tc ON tc.characterId = h.characterId'
			+ ' WHERE tc.tournamentId = ? AND h.tournamentId = ?'
			+ ' AND tc.userId = ? AND h.userId = ?'
			+ ' AND eventId = 1 order by h.value',
		params = [tourneyId,tourneyId,userId,userId];

	mysql.query('rw', sql, params, 'modules/tournaments/tournaments-model/getSeeds', function(err, results){
		if(err) return cb(err);
		return cb(null,results);
	});
};

module.exports = TournamentsModel;
