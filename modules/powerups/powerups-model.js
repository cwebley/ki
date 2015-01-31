var _ = require('lodash'),
	async = require('async'),
	redis = require('../persistence').redis;

var PowerModel = {};

PowerModel.getInspect = function(opts,cb) {

	var conn = redis.get('persistent', 'rw');

		conn.get('hello', cb);
};

module.exports = PowerModel;
