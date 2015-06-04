var dispatcher = require('../dispatchers/dispatcher');
	constants = require('../constants/constants'),
	EventEmitter = require('events').EventEmitter,
	serverActions = require('../actions/server-action-creators'),
	assign = require('object-assign');

var ActionTypes = constants.ActionTypes;
var CHANGE_EVENT = 'change';

var _tournamentList = [];
var _currentIndex = null;

function _tourneyIndexReceived(tournaments){
	_tournamentList = tournaments
}

// this is pretty broken atm. won't update when you click new tourney in the sidebar
function _setCurrent(slug){
	for(var i=0; i<_tournamentList.length; i++){
		if(_tournamentList[i].slug === slug){
			_currentIndex = i
		}
	}
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
		if(!_currentIndex){
			return _tournamentList[_tournamentList.length-1];
		}
		return _tournamentList[_currentIndex];
	},
	getPrevious: function(){
		if(!_currentIndex){
			return false;
		}
		return _tournamentList[_currentIndex-1];
	},
	getNext: function(){
		if(_currentIndex === _tournamentList.length-1){
			return false;
		}
		return _tournamentList[_currentIndex+1];
	}

});

TournamentIndexStore.dispatchToken = dispatcher.register(function(payload) {
  var action = payload.action;

	switch(action.type) {
		case ActionTypes.GET_TOURNAMENT_INDEX:
			_tourneyIndexReceived(payload.action.data.tournaments);
			TournamentIndexStore.emitChange();
			break;
		case ActionTypes.FOCUS_TOURNAMENT:
			_setCurrent(payload.action.slug);
			break;
	
		default:
		  // do nothing
	}

});

module.exports = TournamentIndexStore;
