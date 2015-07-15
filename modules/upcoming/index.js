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
UpcomingInterface.getNextArray = function(tourneyId,userArr,num,skipCurrent){
	num = parseInt(num,10);
	var start = (skipCurrent) ? 1 : 0;
	var end = (skipCurrent) ? num+1 : num;

	var nextUp = [];
	for(var i=0;i<userArr.length;i++){
		nextUp.push(UpcomingInterface.pending[tourneyId][userArr[i].id].slice(start,end));
	}
	return nextUp;
}

UpcomingInterface.lastMatchup = function(tourneyId,userArr){
	var lastMatch = [];
	var prevArr;
	for(var i=0;i<userArr.length;i++){
		if(!UpcomingInterface.previous[tourneyId]){
			UpcomingInterface.previous[tourneyId] = {};
		}
		if(!UpcomingInterface.previous[tourneyId][userArr[i].id]){
			UpcomingInterface.previous[tourneyId][userArr[i].id] = [];
		};
		prevArr = UpcomingInterface.previous[tourneyId][userArr[i].id];
		if(!prevArr.length){
			return false;
		}
		lastMatch.push(prevArr.slice(prevArr.length-1, prevArr.length));
	}
	return lastMatch;
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

UpcomingInterface.undo = function(tourneyId){
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

UpcomingInterface.rematch = function(tourneyId){
	if(!UpcomingInterface.previous || !UpcomingInterface.previous[tourneyId]){
		return;
	}
	for(var n in UpcomingInterface.previous[tourneyId]){
		var prevLen = UpcomingInterface.previous[tourneyId][n].length;
		if(!prevLen){
			return;
		}
		// read most recent game (but keep it there), unshift onto front of pending matches as a rematch
		UpcomingInterface.pending[tourneyId][n].unshift(UpcomingInterface.previous[tourneyId][n][prevLen-1]);
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
UpcomingInterface.submitCustom = function(tourneyId,uids,matchups,skipCurrent){
	var start = (skipCurrent) ? 1 : 0;

	if(!uids.length || !matchups.length) return false;
	var arr;
	uids.forEach(function(u,i){
		arr = UpcomingInterface.pending[tourneyId][u];

		// TODO spread operator here will be much simpler if code is ever es6-ified
		// splice out the number we are submitting, insert the custom matchups
		arr.splice.apply(arr,[start,matchups[i].length + start].concat(matchups[i]));
		UpcomingInterface.pending[tourneyId][u] = arr;

		// concat what's leftover onto the custom matchups
		// UpcomingInterface.pending[tourneyId][u] = matchups[i].concat(UpcomingInterface.pending[tourneyId][u])
	});
	return true
}

module.exports = UpcomingInterface;
