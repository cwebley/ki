var _ = require('lodash'),
	gamesSvc = require('./games-service');

var GamesInterface = {};

GamesInterface.submitGame = function(options, cb) {
	console.log("games index put game: ", options)
	gamesSvc.saveGame(options, function(err, results){
		return cb(err,results)
	});
};

GamesInterface.newTournament = function(options, cb) {
	gamesSvc.newTournament(options, function(err, results){
		return cb(err,results)
	});
};


module.exports = GamesInterface;
