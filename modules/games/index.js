var _ = require('lodash'),
	gamesSvc = require('./games-service'),
	tourneyMdl = require('../tournaments/tournaments-model'),
	historyIndex = require('../history');

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

GamesInterface.undoLastGame = function(slug,requester,cb) {
	tourneyMdl.getTourneyId(slug,function(err,tid){
		if(err) return cb(err);
		if(!tid) return cb();

		return historyIndex.undoLastGame(tid,slug,requester,true,cb);
	});
};

module.exports = GamesInterface;
