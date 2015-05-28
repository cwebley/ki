var dispatcher = require('../dispatchers/dispatcher'),
    constants = require('../constants/constants');

var ActionTypes = constants.ActionTypes;

module.exports = {

 	logout: function() {
		dispatcher.handleViewAction({
		  type: ActionTypes.LOGOUT
		});
 	}
};
