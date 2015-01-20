var _ = require('lodash'),
	tourneySvc = require('./tournaments-service');

var GamesInterface = {};

GamesInterface.submitGame = function(options, cb) {
	tourneySvc.saveGame(options, function(err, results){
		return cb(err,results)
	});
};

GamesInterface.newTournament = function(options, cb) {
	tourneySvc.newTournament(options, function(err, results){
		return cb(err,results)
	});
};

module.exports = GamesInterface;
