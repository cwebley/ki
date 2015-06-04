var dispatcher = require('../dispatchers/dispatcher'),
	constants = require('../constants/constants'),
	EventEmitter = require('events').EventEmitter,
	assign = require('object-assign');

var ActionTypes = constants.ActionTypes;
var CHANGE_EVENT = 'change';

/* 
	{
		stats: [{player-1s-results},{player-2s-results}],
		seeds: [
			{name: orchid, value: 1, wins: 5, losses: 2, bestStreak: 3},
			...
			...
		]
	}
*/
var _prevData = {};
var _seedAttempt = false;
var _seedSuccess = true

function _previousSeedsReceived(data){
	_prevData = data
}

function _seedSuccess(){
	console.log("SEED SUCCESS")

	_seedAttempt = true
	_seedSuccess = true
}

function _seedFailure(){
	console.log("SEED FAILURE")
	_seedAttempt = true
	_seedSuccess = false
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
	},
	getPrevious: function(){
		return _prevData;
	},
	getStatus: function(){
		return {
			attempt: _seedAttempt,
			success: _seedSuccess
		};
	}
});

SeedStore.dispatchToken = dispatcher.register(function(payload) {
  var action = payload.action;

	switch(action.type) {

		case ActionTypes.GET_PREVIOUS_SEEDS:
			if(payload.action.code !== 200){
				console.log("failed-to-get-previous-seeds");
				break;
			}
			_previousSeedsReceived(payload.action.data);
			SeedStore.emitChange();
			break;

		case ActionTypes.SUBMIT_SEEDS:
			(payload.action.code === 201) ? _seedSuccess() : _seedFailure();
			SeedStore.emitChange();
			break;
	
		default:
		  // do nothing
	}
});

module.exports = SeedStore;
