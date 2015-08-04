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
var _inspectMe = {
	name: "",
	current: "",
	upcoming: []
};
var _inspectThem = {
	name: "",
	current: "",
	upcoming: []
};
var _attemptedPostInspect;
var _succeededPostInspect;
var _attemptedUndo;
var _succeededUndo;
var _attemptedOddsMaker;
var _succeededOddsMaker;
var _attemptedRematch;
var _succeededRematch;
var _inspectOwner;
var _rematchStatus;
var _attemptedAdjust;
var _succeededAdjust;


function _tourneyDataReceived(data){
	console.log("TDATA: ", data);

	_me = data.users[0];
	_them = data.users[1];
	_attemptedUndo = false;
	_attemptedOddsMaker = false;
	_attemptedRematch = false;
	_attemptedAdjust = false;
	_inspectOwner = data.inspect;
	_rematchStatus = data.rematch;
}
function _inspectDataReceived(data){
	console.log("INSPECT DATA: ", data)
	_inspectMe.name = data.me.name;
	_inspectMe.current = data.me.current;
	_inspectThem.name = data.them.name;
	_inspectThem.current = data.them.current;

	// only update the upcoming matches if polling detected a match has been submitted
	if(_inspectMe.upcoming.length !== data.me.upcoming.length){
		_inspectMe.upcoming = data.me.upcoming;
		_inspectThem.upcoming = data.them.upcoming;
	}
}
function _submitMatchupsSuccess(){
	_attemptedPostInspect = true;
	_succeededPostInspect = true;
	_queueStatusReset();
}
function _submitMatchupFailure(){
	_attemptedPostInspect = true;
	_succeededPostInspect = false;
	_queueStatusReset();
}
function _queueStatusReset(){
	setTimeout(function(){
		_attemptedPostInspect = false;
		_succeededPostInspect = false;
	},3000)
}
function _clearInspectData(){
	_inspectMe = {
		name: "",
		current: "",
		upcoming: []
	};
	_inspectThem = {
		name: "",
		current: "",
		upcoming: []
	};
}
function _undoSuccess(){
	_attemptedUndo = true;
	_succeededUndo = true;
}
function _undoFailure(){
	_succeededUndo = false;
	_attemptedUndo = true;
}
function _oddsMakerSuccess(data){
	_succeededOddsMaker = true;
	_attemptedOddsMaker = true;
	_updatePowerStock(data);
}
function _oddsMakerFailure(){
	_succeededOddsMaker = false;
	_attemptedOddsMaker = true;
}
function _rematchSuccess(data){
	_succeededRematch = true;
	_attemptedRematch = true;
	_tourneyDataReceived(data);
}
function _rematchFailure(){
	_succeededRematch = false;
	_attemptedRematch = true;
}
function _adjustSuccess(data){
	_them.characters.forEach(function(c){
		if(data.updatedCharacters[c.name]){
			c.value = data.updatedCharacters[c.name];
		}
	});
	_me.streakPoints = data.streakPoints;
	_succeededAdjust = true;
	_attemptedAdjust = true;
}

function _adjustFailure(){
	_succeededAdjust = false;
	_attemptedAdjust = true;
}
function _updatePowerStock(data){
	if(!data){
		return;
	}
	_me.powerStock = data.powerStock;
}
function _rearrangeMyMatchups(data){
	_inspectMe.upcoming = data
}
function _rearrangeTheirMatchups(data){
	_inspectThem.upcoming = data
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
	},
	inspectMe: function() {
		return _inspectMe;
	},
	inspectThem: function() {
		return _inspectThem;
	},
	inspectDuration: function() {
		if(!_inspectThem || !_inspectMe){
			return false;
		}
		return Math.min(_inspectMe.length,_inspectThem.length);
	},
	inspectStatus: function(){
		return {
			attempt: _attemptedPostInspect,
			success: _succeededPostInspect
		};
	},
	undoStatus: function(){
		return {
			attempt: _attemptedUndo,
			success: _succeededUndo
		};
	},
	oddsMakerStatus: function(){
		return {
			attempt: _attemptedOddsMaker,
			success: _succeededOddsMaker
		};
	},
	rematchStatus: function(){
		return {
			attempt: _attemptedRematch,
			success: _succeededRematch,
			status: _rematchStatus
		};
	},
	inspectOwner: function(){
		return _inspectOwner;
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
				console.log("error-deleting-tournament");
			}
			break;
		case ActionTypes.GET_INSPECT:
			if(payload.action.code !== 200){
				// probably need a better way to handle this
				// but this happens when inspect is being used already
				_clearInspectData();
				TournamentStore.emitChange();
				break;
			}
			_inspectDataReceived(payload.action.data);
			TournamentStore.emitChange();
			break;
		case ActionTypes.POST_INSPECT:
			(payload.action.code === 201) ? _submitMatchupsSuccess() : _submitMatchupFailure();
			_inspectDataReceived(payload.action.data);
			TournamentStore.emitChange();
			break;
		case ActionTypes.UNDO_LAST:
			(payload.action.code === 200) ? _undoSuccess() : _undoFailure();
			_tourneyDataReceived(action.data);
			TournamentStore.emitChange();
			break;
		case ActionTypes.USE_ODDS_MAKER:
			(payload.action.code === 200) ? _oddsMakerSuccess(action.data) : _oddsMakerFailure();
			TournamentStore.emitChange();
			break;
		case ActionTypes.USE_REMATCH:
			(payload.action.code === 200) ? _rematchSuccess(action.data) : _rematchFailure();
			TournamentStore.emitChange();
			break;
		case ActionTypes.ADJUST_OPPONENT_POINTS:
			(payload.action.code === 200) ? _adjustSuccess(action.data) : _adjustFailure();
			TournamentStore.emitChange();
			break;
		case ActionTypes.REARRANGE_MATCHUPS:
			(payload.action.data.who === "me") ? _rearrangeMyMatchups(payload.action.data.matchups) : _rearrangeTheirMatchups(payload.action.data.matchups);
			break;

		default:
		  // do nothing
	}
});

module.exports = TournamentStore;
