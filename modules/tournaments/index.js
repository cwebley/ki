var _ = require('lodash'),
	tourneySvc = require('./tournaments-service');

var TourneyInterface = {};

TourneyInterface.newTournament = function(options, cb) {
	tourneySvc.newTournament(options, function(err, results){
		return cb(err,results)
	});
};

TourneyInterface.getTourneyStats = function(name, cb) {
	tourneySvc.getTourneyStats(name, function(err, results){
		return cb(err,results)
	});
};

module.exports = TourneyInterface;
