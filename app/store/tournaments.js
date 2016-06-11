import { combineReducers } from 'redux';
import * as c from '../constants';

const tournamentsReducer = (state = {}, action) => {
	if (!action || !action.tournamentSlug) {
		return state;
	}
	return {
		[action.tournamentSlug]: tournamentReducer(state[action.tournamentSlug], action)
	};
}

export default tournamentsReducer;

const tournamentReducer = (state = {}, action) => {
	switch (action.type) {

	case c.FETCH_TOURNAMENT_SUCCESS:
		return {
			...action.data
		};
	default:
		return state;
	}
}

export const getTournamentFromState = (state = {}, tournamentSlug) => state[tournamentSlug] || {};
