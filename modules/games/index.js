var _ = require('lodash'),
	gamesSvc = require('./games-service');

var GamesInterface = {};

GamesInterface.endDto = function(endTournament) {
	var dto =  {
		finished:!!endTournament
	}
	return dto
}

GamesInterface.submitGame = function(options, cb) {
	gamesSvc.saveGame(options, function(err, results, endTournament){
		if(err)return cb(err)
		if(!results) return cb()
		return cb(null,GamesInterface.endDto(endTournament))
	});
};

module.exports = GamesInterface;
