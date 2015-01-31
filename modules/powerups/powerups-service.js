var _ = require('lodash'),
	async = require('async'),
	upcoming = require('../upcoming'),
	powerMdl = require('./powerups-model');

var PowerupSvc = {};

PowerupSvc.getInspect = function(opts,cb) {
	powerMdl.getInspect(opts,function(err,results){
		return cb(err,results)
	});
};

module.exports = PowerupSvc;