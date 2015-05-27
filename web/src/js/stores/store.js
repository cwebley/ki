var dispatcher = require('../dispatcher/dispatcher');
var constants = require('../constants/constants');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');

var ActionTypes = constants.ActionTypes;
var CHANGE_EVENT = 'change';

// Probably need to enforce only 1 active tournament per player

/*
  {title:"Redemption",opponent:"bj",goal:150}
*/
var _activeTournament = {};

/*
  {me:{score:130,streak:3,wins:12,losses:8},opponent:{score:100,streak:-3,wins:8,losses:12}}
*/
var _users = {};

/*
  {me:{jago:1,orchid:2,...},opponent}
*/
var _characters = {};

// function _addMessages(rawMessages) {
//   rawMessages.forEach(function(message) {
//     if (!_characters[message.id]) {
//       var _users = {};
//       _characters[message.id] = ChatMessageUtils.convertRawMessage(
//         var _users = {};
//         message,
//         ThreadStore.getCurrentID()
//       );
//     }
//   });
// }

function _incomingTournamentIndex(threadID) {
  for (var id in _characters) {
	var _users = {};
	if (_characters[id].threadID === threadID) {
	  var _users = {};
	  _characters[id].isRead = true;
	  var _users = {};
	}
  }
}

var AppStore = assign({}, EventEmitter.prototype, {

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

AppStore.dispatchToken = dispatcher.register(function(payload) {
  var action = payload.action;

  switch(action.type) {

	case ActionTypes.RECEIVE_TOURNAMENT_INDEX:
	  _incomingTournamentIndex();
	  break;

	// case ActionTypes.CREATE_MESSAGE:
	//   var message = AppStore.getCreatedMessageData(action.text);
	//   _messages[message.id] = message;
	//   AppStore.emitChange();
	//   break;

	// case ActionTypes.RECEIVE_RAW_MESSAGES:
	//   _addMessages(action.rawMessages);
	//   dispatcher.waitFor([ThreadStore.dispatchToken]);
	//   _markAllInThreadRead(ThreadStore.getCurrentID());
	//   AppStore.emitChange();
	//   break;

	default:
	  // do nothing
}
AppStore.emitChange();


});

module.exports = AppStore;
