var dispatcher = require('../dispatchers/dispatcher'),
    constants = require('../constants/constants'),
    api = require('../utils/api');

var ActionTypes = constants.ActionTypes;

module.exports = {

 	logout: function() {
		dispatcher.handleViewAction({
		  type: ActionTypes.LOGOUT
		});
 	},
 	focusTournament: function(slug) {
 		dispatcher.handleViewAction({
 			type: ActionTypes.FOCUS_TOURNAMENT,
 			slug: slug
 		});
 	}
};
