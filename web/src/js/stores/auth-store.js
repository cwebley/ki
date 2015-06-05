var dispatcher = require('../dispatchers/dispatcher');
var constants = require('../constants/constants');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');

var ActionTypes = constants.ActionTypes;
var CHANGE_EVENT = 'change';

function _tokenReceived(token){
	localStorage.token = token;
}
function _logout(){
	delete localStorage.token;
}

var AuthStore = assign({}, EventEmitter.prototype, {

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

	loggedIn: function(){
		return !!localStorage.token
	},

});

AuthStore.dispatchToken = dispatcher.register(function(payload) {
	var action = payload.action;

	switch(action.type) {

		case ActionTypes.LOGIN:
			_tokenReceived(payload.action.data.token);
			AuthStore.emitChange();
			break;
	
		case ActionTypes.LOGOUT:
			_logout();
			AuthStore.emitChange();
			break;
	
		default:
		// do nothing
	}

});

module.exports = AuthStore;
