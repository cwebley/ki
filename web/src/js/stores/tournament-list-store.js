var dispatcher = require('../dispatchers/dispatcher');
var constants = require('../constants/constants');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');

var ActionTypes = constants.ActionTypes;
var CHANGE_EVENT = 'change';

var _tournaments = {};

function _tourneyIndexReceived(tournaments){
	_tournaments = tournaments
}

var TournamentIndexStore = assign({}, EventEmitter.prototype, {

	emitChange: function() {
		this.emit(CHANGE_EVENT);
	},

	/**
	* @param {function} callback
	*/
	addChangeListener: function(callback) {
		this.on(CHANGE_EVENT, callback);
	},
  
	removeChangeListener: function(callback) {
		this.removeListener(CHANGE_EVENT, callback);
	},

	get: function() {
		return _tournaments;
	},

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
