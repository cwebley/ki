var _ = require('lodash'),
	async = require('async'),
	mysql = require('../persistence').mysql;

var UsersModel = {};

UsersModel.getUserId = function(userName, cb) {
	var sql = 'SELECT id FROM users WHERE name = ?',
		params = [userName];

	mysql.query('rw', sql, params, 'modules/users/users-model/getUserId', function(err, results){
		if(err) return cb(err);
		if(!results || !results.length) return cb();
		return cb(null, results[0].id);
	});
};

UsersModel.getUserObj = function(userName, cb) {
	var sql = 'SELECT id FROM users WHERE name = ?',
		params = [userName];

	mysql.query('rw', sql, params, 'modules/users/users-model/getUserObj', function(err, results){
		if(err) return cb(err);
		if(!results || !results.length) return cb();
		return cb(null,results[0])
	});
};

UsersModel.getUserList = function(omittedName, cb) {
	var sql = 'SELECT name FROM users WHERE name != ?',
		params = [omittedName];

	mysql.query('rw', sql, params, 'modules/users/users-model/getUserList', function(err, results){
		if(err) return cb(err);
		return cb(null, results);
	});
};

UsersModel.getOpponentsNames = function(omittedName,tourneyName,cb) {
	var sql = 'SELECT u.name FROM users u'
			+ ' JOIN tournamentUsers tu ON tu.userId = u.id'
			+ ' JOIN tournaments t ON t.id = tu.tournamentId'
			+ ' WHERE u.name != ? AND t.name = ?',
		params = [omittedName,tourneyName];

	mysql.query('rw', sql, params, 'modules/users/users-model/getOpponentsName', function(err, results){
		if(err) return cb(err);
		return cb(null, results);
	});
};

UsersModel.createUser = function(name,pass,email,cb) {
	var sql = 'INSERT INTO users (name,password,email) VALUES (?,?,?)',
		params = [name,pass,email];

	mysql.query('rw', sql, params, 'modules/users/users-model/createUser', function(err, results){
		if(err) return cb(err);
		return cb(null, results);
	});
};

UsersModel.verifyUser = function(name,pass,cb) {
	var sql = 'SELECT id FROM users WHERE name = ? AND password = ?',
		params = [name,pass];

	mysql.query('rw', sql, params, 'modules/users/users-model/verifyUser', function(err, results){
		if(err) return cb(err);
		if(!results || !results.length) return cb();
		return cb(null, results[0].id);
	});
};

UsersModel.getCharacterId = function(characterName, cb) {
	var sql = 'SELECT id FROM characters WHERE name = ?',
		params = [characterName];

	mysql.query('rw', sql, params, 'modules/users/users-model/getCharacterId', function(err, results){
		if(err) return cb(err)
		if(!results || !results.length) return cb()
		return cb(null, results[0].id);
	});
};

UsersModel.getAllCharacterIds = function(cb) {
	var sql = 'SELECT id FROM characters',
		params = [];

	mysql.query('rw', sql, params, 'modules/users/users-model/getAllCharacterIds', function(err, results){
		if(err) return cb(err)
		return cb(null, _.pluck(results, 'id'));
	});
};

UsersModel.getCharacterValue = function(tid,uid,cid,cb) {
	var sql = 'SELECT value FROM tournamentCharacters WHERE tournamentId = ? AND userId = ? AND characterid = ?',
		params = [tid,uid,cid];

	mysql.query('rw', sql, params, 'modules/users/users-model/getCharacterValue', function(err, results){
		if(err) return cb(err)
		if(!results || !results.length) return cb()
		return cb(null, results[0].value);
	});
};

// tid: integer,
// uid: integer,
// cids: array of all characterIds
UsersModel.insertOrResetCharVals = function(tid,uid,cids,cb) {
	if(!cids.length) return cb(new Error('users-model/insertOrResetCharVals/no-character-ids-array'))

	// charactersData
	var insert = 'INSERT INTO `charactersData` (userId,characterId)',
		values = ' VALUES (?,?)',
		onDup = ' ON DUPLICATE KEY UPDATE userId = VALUES(userId)',
		params = [];

	for(var i=0;i<cids.length;i++){
		if(i< cids.length-1){
			values += ',(?,?)'
		}
		params.push(uid)
		params.push(cids[i])
	}

	mysql.query('rw', insert + values + onDup, params, 'modules/users/users-model/insertOrResetCharVals:charactersData', function(err, results){
		if(err)return cb(err)
		if(!results)return cb()

		// tournamentCharacters
		var insert = 'INSERT INTO `tournamentCharacters` (tournamentId,userId,characterId,value)',
			values = ' VALUES (?,?,?,?)',
			params = [];

		for(var i=0;i<cids.length;i++){
			if(i< cids.length-1){
				values += ',(?,?,?,?)'
			}
			params.push(tid)
			params.push(uid)
			params.push(cids[i])
			params.push(0)
		}

		mysql.query('rw', insert + values, params, 'modules/users/users-model/insertOrResetCharVals:tournamentUsers', function(err, results){
			return cb(err,results)
		});
	});
};

// theres a lot of stuff going on in here, especially with history table update.
// rows: object {cid:1,tid:1,:uid:1,:value:1}
UsersModel.insertSeeds = function(rows, cb) {

	// seeds
	var sql = 'INSERT INTO seeds (tournamentId,userId,characterId,value) VALUES(?,?,?,?)',
		onDup = 'ON DUPLICATE KEY UPDATE value = VALUES(value)',
		params =[];

	for(var i=0;i<rows.length;i++){
		if(i< rows.length-1){
			sql += ',(?,?,?,?)'
		}
		params.push(rows[i].tid)
		params.push(rows[i].uid)
		params.push(rows[i].cid)
		params.push(rows[i].value)
	}

	mysql.query('rw', sql+onDup, params, 'modules/users/users-model/insertSeeds:seeds', function(err, results){
		if(err)return cb(err)
		if(!results) return cb()

		// tournamentCharacters
		sql = 'INSERT INTO tournamentCharacters (tournamentId,userId,characterId,value) VALUES(?,?,?,?)'
		params = [];

		for(var i=0;i<rows.length;i++){
			if(i< rows.length-1){
				sql += ',(?,?,?,?)'
			}
			params.push(rows[i].tid)
			params.push(rows[i].uid)
			params.push(rows[i].cid)
			params.push(rows[i].value)
		}

		mysql.query('rw', sql+onDup, params, 'modules/users/users-model/insertSeeds:tournamentCharacters', function(err, results){
			if(err)return cb(err)
			if(!results) return cb()

			// get seed event for history update, just for thoroughness and in case the events table changes.
			sql = 'SELECT id FROM events WHERE description = ?'
			params = ['seeding'];

			mysql.query('rw', sql, params, 'modules/users/users-model/insertSeeds:getEvent', function(err, results){
				if(err) return cb(err)
				if(!results || !results.length) return cb(new Error('event-id-not-found-for-seeding-event'))
				var eventId = results[0].id
	
				// history: this actually leads to duplicate entries if the seed form is sent more than once. 
				// might be a future problem in stat calculation
				sql = 'INSERT INTO history (tournamentId,userId,characterId,eventId,value,delta) VALUES(?,?,?,?,?,?)'
				params = [];
	
				for(var i=0;i<rows.length;i++){
					if(i< rows.length-1){
						sql += ',(?,?,?,?,?,?)'
					}
					params.push(rows[i].tid)
					params.push(rows[i].uid)
					params.push(rows[i].cid)
					params.push(eventId)
					params.push(rows[i].value)
					params.push(rows[i].value)
				}

				mysql.query('rw', sql, params, 'modules/users/users-model/insertSeeds:history', function(err, results){
					if(err)return cb(err)
					if(!results) return cb()
	
					// Update tournamentUsers seed status
					sql = 'UPDATE tournamentUsers SET seeded = 1 WHERE tournamentId = ? AND userId = ?',
					params = [rows[0].tid, rows[0].uid]
		
					mysql.query('rw', sql, params, 'modules/users/users-model/insertSeeds:update-seed-status', function(err, results){
						if(err) return cb(err)
		
						// Update tournament seed status if all users have seeded
						UsersModel.updateTournamentSeedStatus(rows[0].tid,cb)
					});
				});
			});
		});
	});
};

UsersModel.updateTournamentSeedStatus = function(tid,cb) {
	var sql = 'SELECT seeded FROM tournamentUsers WHERE tournamentId = ?'
		params = [tid];

	mysql.query('rw', sql, params, 'modules/users/users-model/updateTournamentSeedStatus:select-from-tu', function(err, results){
		if(err)return cb(err)
		if(!results || !results.length) return cb(new Error('no-results-for-seeded-in-tournamentUsers'))

		for(var i=0;i<results.length;i++){
			if(!results[i].seeded){
				return cb(null,{seeded:false}) // seeding not complete
			}
		}

		sql = 'UPDATE tournaments SET seeded = 1 WHERE id = ?'
		mysql.query('rw', sql, params, 'modules/users/users-model/updateTournamentSeedStatus:update-touranments-seeded', function(err, results){
			return cb(err,{seeded:true})
		});
	});
};

UsersModel.getActiveSeedStatus = function(uid, cb) {
	var sql = 'SELECT t.id, t.name, tu.seeded FROM tournamentUsers tu'
		+ ' LEFT JOIN tournaments t ON t.id = tu.tournamentId'
		+ ' WHERE tu.userId = ? AND t.active = 1',
		params = [uid];

	mysql.query('rw', sql, params, 'modules/users/users-model/getActiveSeedStatus', function(err, results){
		if(err)return cb(err)
		return cb(null, results)
	});
};

// Not in use right now
// rows: object {cid:1,:uid:1,:value:1}
UsersModel.updateCharacterValue = function(rows, cb) {
	var sql = 'UPDATE charactersData SET value = ? WHERE userId = ? AND characterId = ?',
		params = [value, uid, cid];

	mysql.query('rw', sql, params, 'modules/users/users-model/updateCharacterValue', function(err, results){
		if(err) return cb(err)
		if(!results || !results.length) return cb()
		return cb(null, results[0].id);
	});
};

UsersModel.getCharacterStreak = function(tid,uid,cid,cb) {
	var sql = 'SELECT curStreak FROM tournamentCharacters WHERE tournamentId = ? AND userId = ? AND characterId = ?',
		params = [tid,uid,cid];

	mysql.query('rw', sql, params, 'modules/users/users-model/getCharacterStreak', function(err, results){
		if(err) return cb(err)
		if(!results || !results.length) return cb()
		return cb(null, results[0]);
	});
};

UsersModel.getUserStreak = function(uid,cb) {
	var sql = 'SELECT curStreak FROM users WHERE id = ?',
		params = [uid];

	mysql.query('rw', sql, params, 'modules/users/users-model/getCharacterStreak', function(err, results){
		if(err) return cb(err)
		if(!results || !results.length) return cb()
		return cb(null, results[0]);
	});
};

module.exports = UsersModel;
