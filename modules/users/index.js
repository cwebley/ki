var _ = require('lodash'),
	async = require('async'),
	userSvc = require('./user-service'),
	userMdl = require('./user-model');

var UserInterface = {};

UserInterface.register = function(options, cb) {
	console.log("register ops: ", options)
	var success = true
	// esMdl.getStream(slug(options.username), slug(options.appSlug), function(err, streams){
	// 	if (err) return cb(err);
	// 	if(!streams || !streams.length) return cb();
	cb(null, success);
	// }.bind(this));
};


module.exports = UserInterface;
