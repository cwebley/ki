var dispatcher = require('../dispatcher/dispatcher'),
    constants = require('../constants/constants');

var ActionTypes = constants.ActionTypes;

module.exports = {

  receieveTourneyData: function(data) {
    dispatcher.handleServerAction({
      type: ActionTypes.RECEIVE_TOURNAMENT_DATA,
      data: data
    });
  };
};
