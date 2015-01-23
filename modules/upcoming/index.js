var _ = require('lodash'),
	constants = require('../constants');

var UpcomingInterface = {};
UpcomingInterface.pending = {};

// UpcomingInterface.peek = function(){
// 	for(var n = pending){
		
// 	}
// }

//uids: array of userIds in a tournament
UpcomingInterface.create = function(uids){
	UpcomingInterface.pending = {};
	for(var i=0; i<uids.length; i++){
		UpcomingInterface.pending[uids[i]] = [];
	}
}

UpcomingInterface.fill = function(){
	for(var n in UpcomingInterface.pending){
		while(UpcomingInterface.pending[n].length<20){
			var random = _.random(constants.characters.length-1)
			UpcomingInterface.pending[n].push(constants.characters[random])
		}
	}
}

//num = int number of matches you want
UpcomingInterface.getNext = function(num){
	var nextUp = {};
	for(var n in UpcomingInterface.pending){
		nextUp[n] = [];
		for(var i=0;i<num;i++){
			nextUp[n].push(UpcomingInterface.pending[n][i])
		}
	}
	return nextUp
}

UpcomingInterface.removeFirst = function(){
	for(var n in UpcomingInterface.pending){
		UpcomingInterface.pending[n].shift()
	}
}

module.exports = UpcomingInterface;
