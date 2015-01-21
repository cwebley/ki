var _ = require('lodash'),
	tourneySvc = require('./tournaments-service');

var TourneyInterface = {};

TourneyInterface.newTournament = function(options, cb) {
	tourneySvc.newTournament(options, function(err, results){
		return cb(err,results)
	});
};

TourneyInterface.getAllTourneyStats = function(name, cb) {
	tourneySvc.getAllTourneyStats(name, function(err, results){
		if(err)return cb(err)
		return cb(err,results)
	});
};

TourneyInterface.getTourneyStats = function(name, cb) {
	tourneySvc.getTourneyStats(name, function(err, results){
		if(err)return cb(err)
		return cb(err,results)
	});
};

module.exports = TourneyInterface;
