var dispatcher = require('../dispatchers/dispatcher');
var constants = require('../constants/constants');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');

var ActionTypes = constants.ActionTypes;
var CHANGE_EVENT = 'change';

var _tournamentList = [];
var _currentIndex = null;

function _tourneyIndexReceived(tournaments){
	console.log("TOURNEY INDEX RECEIVED: ", tournaments)
	_tournamentList = tournaments
}

var TournamentIndexStore = assign({}, EventEmitter.prototype, {

	emitChange: function() {
		this.emit(CHANGE_EVENT);
	},
	addChangeListener: function(callback) {
		this.on(CHANGE_EVENT, callback);
	},
	removeChangeListener: function(callback) {
		this.removeListener(CHANGE_EVENT, callback);
	},
	get: function() {
		return _tournamentList;
	},
	getCurrent: function(){
		return _tournamentList[_currentIndex].slug
	},
	setCurrent: function(slug){
		
	},
	getPrevious: function(){
		if(_currentIndex === 0){
			return false;
		}
		return _tournamentList[_currentIndex-1]
	},
	getNext: function(){
		if(_currentIndex === _tournamentList.length-1){
			return false;
		}
		return _tournamentList[_currentIndex+1]
	}

});

TournamentIndexStore.dispatchToken = dispatcher.register(function(payload) {
  var action = payload.action;

	switch(action.type) {

	case ActionTypes.GET_TOURNAMENT_INDEX:
		_tourneyIndexReceived(payload.action.data.tournaments);
		TournamentIndexStore.emitChange();
		break;

	default:
	  // do nothing
}



});

module.exports = TournamentIndexStore;
