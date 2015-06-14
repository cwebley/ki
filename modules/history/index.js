var	historyMdl = require('./history-model');

var History = {};

/*
	On game submit:
		

*/

History.recalculateHistory = function(tid, cb){
	// get seed data
	historyMdl.recalculateSeedsFromHistory(tid,function(err,historyData){
		if(err) return cb(err);
		// update values in tournamentCharacters

	});
}

History.submitGame = function(options, cb) {

}

History.undo = function(options, cb) {

}

module.exports = History;
