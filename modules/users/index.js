var _ = require('lodash'),
	async = require('async'),
	userSvc = require('./user-service'),
	userMdl = require('./user-model'),
	mysql = require('../persistence').mysql;

var UserInterface = {};

UserInterface.register = function(options, cb) {
	console.log("register ops: ", options)
	var success = true
	var sql = 'SELECT name FROM characters WHERE season = ?',
		params = [1];

	mysql.query('rw', sql, params, 'modules/users/get-characters', function(err, results){
		console.log("MYSQL CB: ", err, results)
		return cb(null, success);
	});

	// esMdl.getStream(slug(options.username), slug(options.appSlug), function(err, streams){
	// 	if (err) return cb(err);
	// 	if(!streams || !streams.length) return cb();
	// cb(null, success);
	// }.bind(this));
};


module.exports = UserInterface;
