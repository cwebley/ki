var dispatcher = require('../dispatchers/dispatcher'),
    constants = require('../constants/constants'),
    api = require('../utils/api');

var ActionTypes = constants.ActionTypes;

serverActions = {

 	getTournamentIndex: function() {
 		api.getTournamentIndex(function(code,body){
 			dispatcher.handleServerAction({
				type: ActionTypes.GET_TOURNAMENT_INDEX,
				code: code,
				data: body
			});
 		});
 	},
 	getTournamentData: function(slug) {
 		api.getTournamentData(slug,function(code,body){
 			dispatcher.handleServerAction({
				type: ActionTypes.GET_TOURNAMENT_DATA,
				code: code,
				data: body
			});
 		});
 	},
 	submitGame: function(data){
 		api.submitGame(data,function(code){
 			dispatcher.handleServerAction({
 				type: ActionTypes.SUBMIT_GAME,
 				code: code
 			});
 			serverActions.getTournamentData(data.slug)
 		}.bind(this));
 	},
 	login: function(data){
 		api.login(data,function(code,body){
 			dispatcher.handleServerAction({
 				type: ActionTypes.LOGIN,
 				code: code,
 				data: body
 			});
 		});
 	},
 	getPreviousSeeds: function(slug){
 		api.getPreviousSeeds(slug,function(code,body){
 			dispatcher.handleServerAction({
 				type: ActionTypes.GET_PREVIOUS_SEEDS,
 				code: code,
 				data: body
 			});
 		});
 	},
 	submitSeeds: function(slug, data){
 		api.submitSeeds(slug, data,function(code,body){
 			dispatcher.handleServerAction({
 				type: ActionTypes.SUBMIT_SEEDS,
 				code: code,
 				data: body
 			});
 		});
 	},
 	createTournament: function(data){
 		api.createTournament(data,function(code,body){
 			dispatcher.handleServerAction({
 				type: ActionTypes.CREATE_TOURNAMENT,
 				code: code,
 				data: body
 			});
 		});
 	}
};

module.exports = serverActions;
