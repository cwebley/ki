var dispatcher = require('../dispatchers/dispatcher'),
    constants = require('../constants/constants');

var ActionTypes = constants.ActionTypes;

module.exports = {

	receiveLoginToken: function(data) {
		dispatcher.handleServerAction({
			type: ActionTypes.RECEIVE_LOGIN_TOKEN,
			data: data
		});
 	},
 	receiveTournamentIndex: function(data) {
		dispatcher.handleServerAction({
		  type: ActionTypes.RECEIVE_TOURNAMENT_INDEX,
		  data: data
		});
 	},
 	receiveTournamentData: function(data) {
		dispatcher.handleServerAction({
		  type: ActionTypes.RECEIVE_TOURNAMENT_DATA,
		  data: data
		});
 	}
};
