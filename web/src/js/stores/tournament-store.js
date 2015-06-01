var dispatcher = require('../dispatchers/dispatcher');
var constants = require('../constants/constants');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');

var ActionTypes = constants.ActionTypes;
var CHANGE_EVENT = 'change';

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

	/**
	* @param {function} callback
	*/
	addChangeListener: function(callback) {
		this.on(CHANGE_EVENT, callback);
	},
  
	removeChangeListener: function(callback) {
		this.removeListener(CHANGE_EVENT, callback);
	},

	imInThisTournament: function(data){
		//todo check jwt
		var name = "g";
		if(data.users[0].name === name){
			return true
		}
	},

	getMe: function() {
		return _me;
	},	

	getThem: function() {
		return _them;
	},

  // get: function(id) {
  //   return _messages[id];
  // },

  // getAll: function() {
  //   return _messages;
  // },

  // /**
  //  * @param {string} threadID
  //  */
  // getAllForThread: function(threadID) {
  //   var threadMessages = [];
  //   for (var id in _messages) {
  //     if (_messages[id].threadID === threadID) {
  //       threadMessages.push(_messages[id]);
  //     }
  //   }
  //   threadMessages.sort(function(a, b) {
  //     if (a.date < b.date) {
  //       return -1;
  //     } else if (a.date > b.date) {
  //       return 1;
  //     }
  //     return 0;
  //   });
  //   return threadMessages;
  // },

  // getAllForCurrentThread: function() {
  //   return this.getAllForThread(ThreadStore.getCurrentID());
  // },

  // getCreatedMessageData: function(text) {
  //   var timestamp = Date.now();
  //   return {
  //     id: 'm_' + timestamp,
  //     threadID: ThreadStore.getCurrentID(),
  //     authorName: 'Bill', // hard coded for the example
  //     date: new Date(timestamp),
  //     text: text,
  //     isRead: true
  //   };
  // }

});

TournamentStore.dispatchToken = dispatcher.register(function(payload) {
  var action = payload.action;

	switch(action.type) {

	case ActionTypes.RECEIVE_TOURNAMENT_DATA:
		_tourneyDataReceived(payload.action.data);
		TournamentStore.emitChange();
		break;

	default:
	  // do nothing
}



});

module.exports = TournamentStore;
