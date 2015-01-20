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

// // uid: integer,
// // cids: array of all characterIds
// UsersModel.insertSeeds = function(tid, uid, cids, cb) {
// 	if(!cids.length) return cb(new Error('users-model/insertSeeds/no-character-ids-array'))

// 	var insert = 'INSERT INTO `seeds` (tournamentId,userId,characterId,value)',
// 		values = ' VALUES (?,?,?,?)',
// 		// onDup = ' ON DUPLICATE KEY UPDATE value = VALUES(value)',
// 		params = [];

// 	for(var i=0;i<cids.length;i++){
// 		if(i< cids.length-1){
// 			values += ',(?,?,?,?)'
// 		}
// 		params.push(tid)
// 		params.push(uid)
// 		params.push(cids[i])
// 		params.push(0)
// 	}

// 	mysql.query('rw', insert + values, params, 'modules/games/games-model/insertSeeds', function(err, results){
// 		return cb(err,results)
// 	});
// };

// uid: integer,
// cids: array of all characterIds
UsersModel.insertOrResetCharVals = function(uid, cids, cb) {
	if(!cids.length) return cb(new Error('users-model/insertOrResetCharVals/no-character-ids-array'))

	var insert = 'INSERT INTO `charactersData` (userId,characterId,value)',
		values = ' VALUES (?,?,?)',
		onDup = ' ON DUPLICATE KEY UPDATE value = VALUES(value)',
		params = [];

	for(var i=0;i<cids.length;i++){
		if(i< cids.length-1){
			values += ',(?,?,?)'
		}
		params.push(uid)
		params.push(cids[i])
		params.push(0)
	}

	mysql.query('rw', insert + values + onDup, params, 'modules/games/games-model/insertOrResetCharVals', function(err, results){
		return cb(err,results)
	});
};

// rows: object {cid:1,tid:1,:uid:1,:value:1}
UsersModel.insertSeeds = function(rows, cb) {
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

	mysql.query('rw', sql+onDup, params, 'modules/games/games-model/insertSeeds', function(err, results){
		return cb(err, results)
	});
};

module.exports = UsersModel;
