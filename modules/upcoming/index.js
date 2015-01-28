var _ = require('lodash'),
	constants = require('../constants');

var UpcomingInterface = {};
UpcomingInterface.pending = {};

//users: array of users in a tournament
UpcomingInterface.create = function(users){
	UpcomingInterface.pending = {};
	for(var i=0; i<users.length; i++){
		UpcomingInterface.pending[users[i]] = [];
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

// probably only works with 2 players.
UpcomingInterface.removeFirst = function(){
	for(var n in UpcomingInterface.pending){
		UpcomingInterface.pending[n].shift()
	}
}

//users: array of users in a tournament
UpcomingInterface.check = function(users){
	if(!users || !users.length) return false

	for(var i=0;i<users.length;i++){
		if(!UpcomingInterface.pending[users[i]] || !UpcomingInterface.pending[users[i]].length){
			return false
		}
	}
	return true
}

module.exports = UpcomingInterface;
