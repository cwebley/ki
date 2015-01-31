var _ = require('lodash'),
	constants = require('../constants');

var UpcomingInterface = {};
UpcomingInterface.pending = {};

// calls fill on exit
//users: array of users in a tournament
UpcomingInterface.create = function(tourneyName,users){
	UpcomingInterface.pending[tourneyName] = {};
	for(var i=0; i<users.length; i++){
		UpcomingInterface.pending[tourneyName][users[i]] = [];
	}
	UpcomingInterface.fill(tourneyName)
}

UpcomingInterface.fill = function(tourneyName){
	for(var n in UpcomingInterface.pending[tourneyName]){
		while(UpcomingInterface.pending[tourneyName][n].length<20){
			var random = _.random(constants.characters.length-1)
			UpcomingInterface.pending[tourneyName][n].push(constants.characters[random])
		}
	}
}

//num = int number of matches you want
UpcomingInterface.getNext = function(tourneyName,num){
	var nextUp = {};
	for(var n in UpcomingInterface.pending[tourneyName]){
		nextUp[n] = [];
		for(var i=0;i<num;i++){
			nextUp[n].push(UpcomingInterface.pending[tourneyName][n][i])
		}
	}
	return nextUp
}

// probably only works with 2 players.
UpcomingInterface.removeFirst = function(tourneyName){
	for(var n in UpcomingInterface.pending[tourneyName]){
		UpcomingInterface.pending[tourneyName][n].shift()
	}
}

//users: array of users in a tournament
UpcomingInterface.check = function(tourneyName,users){
	if(!users || !users.length) return false
	for(var i=0;i<users.length;i++){
		if(!UpcomingInterface.pending[tourneyName] || !UpcomingInterface.pending[tourneyName][users[i]] || !UpcomingInterface.pending[tourneyName][users[i]].length){
			return false
		}
	}
	return true
}

module.exports = UpcomingInterface;
