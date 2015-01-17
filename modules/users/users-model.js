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

module.exports = UsersModel;
