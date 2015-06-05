var _ = require('lodash'),
	async = require('async'),
	mysql = require('../persistence').mysql;

var GamesModel = {};

GamesModel.insertGameResult = function(options, cb) {

	// games
	var sql = 'INSERT INTO `games` (winningPlayerId, winningCharacterId, losingPlayerId, losingCharacterId, tournamentId, value, supreme) VALUES(?,?,?,?,?,?,?)',
		params = [options.winPid, options.winXid, options.losePid, options.loseXid, options.tourneyId, options.winValue, options.supreme];

	mysql.query('rw', sql, params, 'modules/games/games-model/insertGameResult:games', function(err, results){
		if(err)return cb(err);
		if(!results.insertId)return cb();

		// get game event for history update, just for thoroughness and in case the events table changes.
		sql = 'SELECT id FROM events WHERE description = ?'
		params = ['game'];

		mysql.query('rw', sql, params, 'modules/games/games-model/insertGameResult:getEvent', function(err, results){
			if(err) return cb(err)
			if(!results || !results.length) return cb(new Error('event-id-not-found-for-seeding-event'))
			var eventId = results[0].id

			//history: winner and loser
			sql = 'INSERT INTO history (tournamentId,userId,characterId,eventId,value,delta)'
			+ ' VALUES(?,?,?,?,?,?),(?,?,?,?,?,?)'
			params = [options.tourneyId,options.winPid,options.winXid,eventId,options.winValue,-1,options.tourneyId,options.losePid,options.loseXid,eventId,options.loseValue,+1];
	
			mysql.query('rw', sql, params, 'modules/games/games-model/insertGameResult:history', cb)
		});
	});
};

GamesModel.iceDown = function(tid,uid,icedCid,cb) {
	var sql = 'UPDATE tournamentCharacters SET value = value - 1 WHERE tournamentId = ? AND userId = ? AND characterId != ? AND value > 1',
		params = [tid, uid, icedCid];

	mysql.query('rw', sql, params, 'modules/games/games-model/iceDown', function(err, results){
		if(err)return cb(err)

		// get all other characters
		var sqlChar = 'SELECT id FROM characters WHERE id != ?',
			paramsChar = [icedCid]
		//get ice eventId
		var sqlFireEvent = 'SELECT id FROM events WHERE description = ?',
			paramsFireEvent = ["ice"]
		//get friendlyIce eventId
		var sqlFIEvent = 'SELECT id FROM events WHERE description = ?',
			paramsFIEvent = ["friendlyIce"]

		async.parallel([
			function(done){mysql.query('rw', sqlChar, paramsChar, 'modules/games/games-model/iceDown:get-characters', done)},
			function(done){mysql.query('rw', sqlFireEvent, paramsFireEvent, 'modules/games/games-model/iceDown:get-ice-event', done)},
			function(done){mysql.query('rw', sqlFIEvent, paramsFIEvent, 'modules/games/games-model/iceDown:get-ice-event', done)}
		],function(err,results){
			if(err) return cb(err)

			//history
			//ice character
			var histIceSql = 'INSERT INTO history (tournamentId,userId,characterId,eventId,delta) VALUES (?,?,?,?,?),',
				histIceParams = [tid,uid,icedCid,results[1][0].id,0],
				moreQMs = [];

			//friendly ice changes
			for(var i=0;i<results[0].length;i++){
				moreQMs.push('(?,?,?,?,?)')
				histIceParams.push(tid,uid,results[0][i].id,results[2][0].id,-1)
			}
			histIceSql += moreQMs.join(',')
			mysql.query('rw', histIceSql, histIceParams, 'modules/games/games-model/iceDown:insert-history', cb)
		});
	});
};

GamesModel.fireUp = function(tid,uid,fireCid,cb) {
	// fire effects
	var sql = 'UPDATE tournamentCharacters SET value = value + 1 WHERE tournamentId = ? AND userId = ? AND characterId != ?',
		params = [tid, uid, fireCid];

	mysql.query('rw', sql, params, 'modules/games/games-model/fireUp:fire-effects', function(err, results){
		if(err) return cb(err)

		// get all other characters
		var sqlChar = 'SELECT id FROM characters WHERE id != ?',
			paramsChar = [fireCid]
		//get fire eventId
		var sqlFireEvent = 'SELECT id FROM events WHERE description = ?',
			paramsFireEvent = ["fire"]
		//get friendlyFire eventId
		var sqlFFEvent = 'SELECT id FROM events WHERE description = ?',
			paramsFFEvent = ["friendlyFire"]

		async.parallel([
			function(done){mysql.query('rw', sqlChar, paramsChar, 'modules/games/games-model/fireUp:get-characters', done)},
			function(done){mysql.query('rw', sqlFireEvent, paramsFireEvent, 'modules/games/games-model/fireUp:get-fire-event', done)},
			function(done){mysql.query('rw', sqlFFEvent, paramsFFEvent, 'modules/games/games-model/fireUp:get-fire-event', done)}
		],function(err,results){
			if(err) return cb(err)

			//history
			//fire character
			var histFireSql = 'INSERT INTO history (tournamentId,userId,characterId,eventId,delta) VALUES (?,?,?,?,?),',
				histFireParams = [tid,uid,fireCid,results[1][0].id,0],
				moreQMs = [];

			//friendly fire changes
			for(var i=0;i<results[0].length;i++){
				moreQMs.push('(?,?,?,?,?)')
				histFireParams.push(tid,uid,results[0][i].id,results[2][0].id,1)
			}
			histFireSql += moreQMs.join(',')
			mysql.query('rw', histFireSql, histFireParams, 'modules/games/games-model/fireUp:insert-history', cb)
		});
	});
};

GamesModel.incWinCharCurStreak = function(tid,uid,cid,cb) {
		var sql = 'UPDATE tournamentCharacters tc, charactersData cd'
		+ ' SET tc.curStreak = CASE WHEN tc.curStreak < 1 THEN 1 ELSE tc.curStreak +1 END'
		+ ', tc.bestStreak = CASE WHEN tc.curStreak > tc.bestStreak THEN tc.curStreak ELSE tc.bestStreak END'
		+ ', cd.globalBestStreak = CASE WHEN tc.curStreak > cd.globalBestStreak THEN tc.curStreak ELSE cd.globalBestStreak END'
		+ ' WHERE tc.characterId=cd.characterId AND tc.userId = cd.userId' // JOINS
		+ ' AND tc.tournamentId = ? AND tc.userId = ? AND tc.characterId = ?'
		params = [tid,uid,cid];

	mysql.query('rw', sql, params, 'modules/games/games-model/incWinCharCurStreak', function(err, results){
		return cb(err,results)
	});
};

GamesModel.resetLoseCharCurStreak = function(tid,uid,cid,cb) {
	var sql = 'UPDATE tournamentCharacters SET curStreak = CASE WHEN curStreak > 0 THEN -1 ELSE curStreak -1 END WHERE tournamentId = ? AND userId = ? AND characterId = ?',
		params = [tid,uid,cid];

	mysql.query('rw', sql, params, 'modules/games/games-model/resetLoseCharCurStreak', function(err, results){
		return cb(err,results)
	});
};

GamesModel.decWinCharValue = function(tid,uid,cid,cb) {
	var sql = 'UPDATE tournamentCharacters SET value = value-1 WHERE tournamentId = ? AND userId = ? AND characterId = ? AND value > 1',
		params = [tid,uid,cid];

	mysql.query('rw', sql, params, 'modules/games/games-model/decWinCharValue', function(err, results){
		return cb(err,results)
	});
};

GamesModel.incLoseCharValue = function(tid,uid,cid,cb) {
	var sql = 'UPDATE tournamentCharacters SET value = value+1 WHERE tournamentId = ? AND userId = ? AND characterId = ?',
		params = [tid,uid,cid];

	mysql.query('rw', sql, params, 'modules/games/games-model/incLoseCharValue', function(err, results){
		return cb(err,results)
	});
};

GamesModel.incWinUsersStreak = function(tid,uid,cb) {
	var sql = 'UPDATE tournamentUsers tu, users u'
		+ ' SET tu.curStreak = CASE WHEN tu.curStreak < 0 THEN 1 ELSE tu.curStreak+1 END'
		+ ', tu.bestStreak = CASE WHEN tu.curStreak > tu.bestStreak THEN tu.curStreak ELSE tu.bestStreak END'
		+ ', u.globalBestStreak = CASE WHEN tu.curStreak > u.globalBestStreak THEN tu.curStreak ELSE u.globalBestStreak END'
		+ ' WHERE tu.userId = u.id' // JOIN
		+ ' AND tu.tournamentId = ? AND tu.userId = ?',
		params = [tid,uid];

	mysql.query('rw', sql, params, 'modules/games/games-model/incWinUsersStreak', function(err, results){
		return cb(err,results)
	});
};

GamesModel.decLossUsersStreak = function(tid,uid,cb) {
	var sql = 'UPDATE tournamentUsers SET curStreak = CASE WHEN curStreak > 0 THEN -1 ELSE curStreak-1 END'
		+ ' WHERE tournamentId = ? AND userId = ?',
		params = [tid,uid];

	mysql.query('rw', sql, params, 'modules/games/games-model/decLossUsersStreak', function(err, results){
		return cb(err,results)
	});
};

GamesModel.incWinUsersWins = function(tid,uid,cb) {
	var sql = 'UPDATE tournamentUsers tu, users u'
		+ ' SET tu.wins = tu.wins + 1, u.wins = u.wins + 1'
		+ ' WHERE tu.userId = u.id' // JOIN
		+ ' AND tu.tournamentId = ? AND tu.userId = ?',
		params = [tid,uid];

	mysql.query('rw', sql, params, 'modules/games/games-model/incWinUsersWins', function(err, results){
		return cb(err,results)
	});
};

GamesModel.incLoseUsersLosses = function(tid,uid,cb) {
	var sql = 'UPDATE tournamentUsers tu, users u'
		+ ' SET tu.losses = tu.losses + 1, u.losses = u.losses + 1'
		+ ' WHERE tu.userId = u.id' // JOIN
		+ ' AND tu.tournamentId = ? AND tu.userId = ?',
		params = [tid,uid];

	mysql.query('rw', sql, params, 'modules/games/games-model/incLoseUsersLosses', function(err, results){
		return cb(err,results)
	});
};

GamesModel.incWinCharWins = function(tid,uid,cid,cb) {
	var sql = 'UPDATE tournamentCharacters tc, charactersData cd'
		+ ' SET tc.wins = tc.wins + 1, cd.wins = cd.wins+1'
		+ ' WHERE tc.userId = cd.userId AND tc.characterId = cd.characterId' // JOIN
		+ ' AND tc.tournamentId = ? AND tc.userId = ? AND tc.characterId = ?',
		params = [tid,uid,cid];

	mysql.query('rw', sql, params, 'modules/games/games-model/incWinCharWins', function(err, results){
		return cb(err,results)
	});
};

GamesModel.incLoseCharLosses = function(tid,uid,cid,cb) {
	var sql = 'UPDATE tournamentCharacters tc, charactersData cd'
		+ ' SET tc.losses = tc.losses + 1, cd.losses = cd.losses + 1'
		+ ' WHERE tc.userId = cd.userId AND tc.characterId = cd.characterId' // JOIN
		+ ' AND tc.tournamentId = ? AND tc.userId = ? AND tc.characterId = ?',
		params = [tid,uid,cid];

	mysql.query('rw', sql, params, 'modules/games/games-model/incLoseCharLosses', function(err, results){
		return cb(err,results)
	});
};

GamesModel.updateWinnerScore = function(tid,uid,value,cb) {
	var sql = 'UPDATE tournamentUsers SET score = score + ? WHERE tournamentId = ? AND userId = ?',
		params = [value,tid,uid];

	mysql.query('rw', sql, params, 'modules/games/games-model/updateWinnerScore', function(err, results){
		return cb(err,results)
	});
};

// tid: integer tournamentId
GamesModel.getTournamentScores = function(tid,cb) {
	var sql = 'SELECT u.id userId, u.name, tu.score, t.goal FROM tournaments t'
			+ ' JOIN tournamentUsers tu ON tu.tournamentId = t.id'
			+ ' JOIN users u ON u.id = tu.userId'
			+ ' WHERE t.id = ?' 
			+ ' ORDER BY tu.score DESC',
		params = [tid];

	mysql.query('rw', sql, params, 'modules/games/games-model/getTournamentScores', function(err, results){
		return cb(err,results)
	});
};

GamesModel.getFireChars = function(tid,uid,cid,cb) {
	var sql = 'SELECT characterId FROM tournamentCharacters'
		+ ' WHERE tournamentId = ? AND userId = ? AND curStreak >= 3'
		+ ' AND characterId != ?'
		params = [tid,uid,cid];

	mysql.query('rw', sql, params, 'modules/games/games-model/countFireChars', function(err, results){
		if(err) return cb(err)
		return cb(null,_.pluck(results,'characterId'))
	});
};

// fireChars: array of characterIds on fire
GamesModel.updateFireWins = function(fireChars,tid,uid,cb) {
	var sqlCharLvl = 'UPDATE tournamentCharacters tc, charactersData cd'
		+ ' SET tc.fireWins = tc.fireWins + 1, cd.fireWins = cd.fireWins + 1'
		+ ' WHERE tc.characterId = cd.characterId AND tc.userId = cd.userId' // JOIN
		+ ' AND tc.tournamentId = ? AND tc.userId = ? AND tc.characterId in (?',
		paramsCharLvl = [tid,uid,fireChars[0]];

		for(var i=1;i<fireChars.length;i++){
			sqlCharLvl += ',?'
			paramsCharLvl.push(fireChars[i])
		}
		sqlCharLvl += ')'

	var sqlUserLvl = 'UPDATE tournamentUsers SET fireWins = fireWins + ?'
		+ ' WHERE tournamentId = ? AND userId = ?',
		paramsUserLvl = [fireChars.length,tid,uid]

	async.parallel([
		function(done){
			mysql.query('rw', sqlCharLvl, paramsCharLvl, 'modules/games/games-model/updateFireWins:charLvl', done)
		},
		function(done){
			mysql.query('rw', sqlUserLvl, paramsUserLvl, 'modules/games/games-model/updateFireWins:userLvl', done)
		}
	],cb);
};

module.exports = GamesModel;
