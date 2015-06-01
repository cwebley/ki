var dispatcher = require('../dispatchers/dispatcher'),
	constants = require('../constants/constants'),
	EventEmitter = require('events').EventEmitter,
	assign = require('object-assign');

var ActionTypes = constants.ActionTypes;
var CHANGE_EVENT = 'change';

function _seedDataReceived(data){
	console.log("SEED DATA RECEIVED: ", data)
}

var SeedStore = assign({}, EventEmitter.prototype, {

	emitChange: function() {
		this.emit(CHANGE_EVENT);
	},
	addChangeListener: function(callback) {
		this.on(CHANGE_EVENT, callback);
	},
	removeChangeListener: function(callback) {
		this.removeListener(CHANGE_EVENT, callback);
	}
});

SeedStore.dispatchToken = dispatcher.register(function(payload) {
  var action = payload.action;

	switch(action.type) {

		case ActionTypes.GET_SEED_DATA:
			_seedDataReceived(payload.action.data);
			SeedStore.emitChange();
			break;
	
		default:
		  // do nothing
	}
});

module.exports = SeedStore;
