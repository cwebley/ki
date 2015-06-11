var _ = require('lodash'),
	constants = require('../constants');

var UpcomingInterface = {};
UpcomingInterface.pending = {};

/*
	tourneyId --> userId --> upcomingCharacters

	{
		1:{
			1:["fulgore","wulf",...],
			2:["spinal","orchid",...]
		},
		2:{
			1:["riptor","wulf",...],
			3:["omen","thunder",...]
		}
	}
*/

// calls fill on exit
//users: array of userIds in a tournament
UpcomingInterface.create = function(tourneyId,users){
	UpcomingInterface.pending[tourneyId] = {};
	for(var i=0; i<users.length; i++){
		UpcomingInterface.pending[tourneyId][users[i]] = [];
	}
	UpcomingInterface.fill(tourneyId)
}

UpcomingInterface.fill = function(tourneyId){
	for(var n in UpcomingInterface.pending[tourneyId]){
		while(UpcomingInterface.pending[tourneyId][n].length<20){
			var random = _.random(constants.characters.length-1)
			UpcomingInterface.pending[tourneyId][n].push(constants.characters[random])
		}
	}
}

/*num = int number of matches you want
returns object: {
	"g": [orchid,fulgore],
	"bj": [aria, cinder]
}*/
UpcomingInterface.getNext = function(tourneyId,userArr,num){
	var nextUp = {};
	for(var i=0;i<userArr.length;i++){
		nextUp[userArr[i].name] = [];
		for(var j=0;j<num;j++){
			nextUp[userArr[i].name].push(UpcomingInterface.pending[tourneyId][userArr[i].id][j])
		}
	}
	return nextUp
}

/*num = int number of matches you want
	returns nested arrays, relies on caller to know the order
	[[orchid,fulgore],[aria,cinder]]
*/
UpcomingInterface.getNextArray = function(tourneyId,userArr,num){
	var nextUp = [];
	for(var i=0;i<userArr.length;i++){
		nextUp.push(UpcomingInterface.pending[tourneyId][userArr[i].id].slice(0,num))
	}
	return nextUp
}

// probably only works with 2 players.
UpcomingInterface.removeFirst = function(tourneyId){
	for(var n in UpcomingInterface.pending[tourneyId]){
		UpcomingInterface.pending[tourneyId][n].shift()
	}
}

//users: array of users in a tournament
UpcomingInterface.check = function(tourneyId,users){
	if(!users || !users.length) return false
	for(var i=0;i<users.length;i++){
		if(!UpcomingInterface.pending[tourneyId] || !UpcomingInterface.pending[tourneyId][users[i]] || !UpcomingInterface.pending[tourneyId][users[i]].length){
			return false
		}
	}
	return true
}

//matchups expected to be ordered the same as uids
UpcomingInterface.submitCustom = function(tourneyId,uids,matchups){
	if(!uids.length || !matchups.length) return false;
	uids.forEach(function(u,i){
		UpcomingInterface.pending[tourneyId][u] = matchups[i]
	});
	return true
}

module.exports = UpcomingInterface;
