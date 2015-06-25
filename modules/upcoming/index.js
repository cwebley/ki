var _ = require('lodash'),
	constants = require('../constants');

var UpcomingInterface = {};
UpcomingInterface.pending = {};
UpcomingInterface.previous = {}; // previous match saved for each tournament for each player.

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
	userArr: [ { id: 2, name: 'bj' }, { id: 1, name: 'g' } ]
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

UpcomingInterface.removeFirst = function(tourneyId){
	for(var n in UpcomingInterface.pending[tourneyId]){
		if(!UpcomingInterface.previous[tourneyId]){
			UpcomingInterface.previous[tourneyId] = {};
		}
		if(!UpcomingInterface.previous[tourneyId][n]){
			UpcomingInterface.previous[tourneyId][n] = [];
		}
		// remove first item, push onto previous
		UpcomingInterface.previous[tourneyId][n].push(UpcomingInterface.pending[tourneyId][n].shift());
	}
}

UpcomingInterface.rematch = function(tourneyId){
	if(!UpcomingInterface.previous || !UpcomingInterface.previous[tourneyId]){
		return;
	}
	for(var n in UpcomingInterface.previous[tourneyId]){
		if(!UpcomingInterface.previous[tourneyId][n].length){
			return;
		}
		// pop off most recent game, unshift onto front of pending matches
		UpcomingInterface.pending[tourneyId][n].unshift(UpcomingInterface.previous[tourneyId][n].pop());
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
