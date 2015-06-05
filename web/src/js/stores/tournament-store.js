var dispatcher = require('../dispatchers/dispatcher'),
	constants = require('../constants/constants'),
	EventEmitter = require('events').EventEmitter,
	assign = require('object-assign'),
	TournamentListStore = require('./tournament-list-store');

var ActionTypes = constants.ActionTypes;
var CHANGE_EVENT = 'change';

var _tournamentHash = {};
var _me = {};
var _them = {};

function _tourneyDataReceived(data){
	_me = data.users[0];
	_them = data.users[1];
}

var TournamentStore = assign({}, EventEmitter.prototype, {

	emitChange: function() {
		this.emit(CHANGE_EVENT);
	},
	addChangeListener: function(callback) {
		this.on(CHANGE_EVENT, callback);
	},
	removeChangeListener: function(callback) {
		this.removeListener(CHANGE_EVENT, callback);
	},
	getMe: function() {
		return _me;
	},	
	getThem: function() {
		return _them;
	}
});

TournamentStore.dispatchToken = dispatcher.register(function(payload) {
  var action = payload.action;

	switch(action.type) {

	case ActionTypes.GET_TOURNAMENT_DATA:
		_tourneyDataReceived(payload.action.data);
		TournamentStore.emitChange();
		break;
	case ActionTypes.SUBMIT_GAME:
		if(payload.action.code !== 201){
			// do some sort of roll back when/if view-action based rendering happens?
			console.log("Tournament-store-found-an-error-submitting-game");
		}
		break;
	case ActionTypes.DELETE_TOURNAMENT:
		if(payload.action.code !== 200){
			console.log("error-deleting-tournament")
		}
		break;

	default:
	  // do nothing
}



});

module.exports = TournamentStore;
