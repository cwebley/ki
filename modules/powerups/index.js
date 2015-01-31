var _ = require('lodash'),
	async = require('async'),
	upcoming = require('../upcoming'),
	powerSvc = require('./powerups-service'),
	powerMdl = require('./powerups-model');

var PowerInterface = {};

PowerInterface.getInspect = function(opts,cb) {
	powerSvc.getInspect(opts,function(err,results){
		return cb(err,results)
	});
};

module.exports = PowerInterface;