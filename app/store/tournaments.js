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
	case c.SUBMIT_SEEDS_SUCCESS:
		return {
			...state,
			...action.data
		};
	case c.UPDATE_SEEDS:
		return {
			...state,
			seedCharacters: action.data,
			seedValues: action.data.map(c => c.slug)
		};
	case c.DRAFT_CHARACTER_SUCCESS:
		return {
			...state,
			active: action.data.tournamentActive,
			users: tournamentUsersReducer(state.users, action),
			draft: draftReducer(state.draft, action)
		};
	default:
		return state;
	}
}

const tournamentUsersReducer = (state = {}, action) => {
	switch (action.type) {
		case c.DRAFT_CHARACTER_SUCCESS:
			return {
				...state,
				ids: Object.assign({}, state.ids, {
					[state.result[0]]: tournamentUserReducer(state.ids[state.result[0]], action),
					// add a drafting status of true for the right user
					[state.result[1]]: {
						...state.ids[state.result[1]],
						drafting: action.data.drafting === state.result[1]
					}
				})
			};
		default:
			return state;
	}
}

const tournamentUserReducer = (state = {}, action) => {
	switch (action.type) {
		case c.DRAFT_CHARACTER_SUCCESS:
			return {
				...state,
				characters: userCharactersReducer(state.characters, action),
				drafting: action.data.drafting === state.uuid
			};
		default:
			return state;
	}
}

const userCharactersReducer = (state = {}, action) => {
	switch (action.type) {
		case c.DRAFT_CHARACTER_SUCCESS:
			return {
				...state,
				// add character data
				ids: Object.assign({}, state.ids, {
					[action.character.uuid]: userCharacterReducer(state.ids[action.character.uuid], action)
				}),
				// add character uuid to the result array
				result: [...state.result, action.character.uuid]
			};
		default:
			return state;
	}
}

const userCharacterReducer = (state = {}, action) => {
	switch (action.type) {
		case c.DRAFT_CHARACTER_SUCCESS:
			return {
				...action.data.pick,
				wins: 0,
				losses: 0,
				streak: 0,
				bestStreak: 0,
				fireWins: 0,
				...action.character.users[action.userUuid]
			};
		default:
			return state;
	}
}

const draftReducer = (state = {}, action) => {
	switch (action.type) {
		case c.DRAFT_CHARACTER_SUCCESS:
			return {
				...state,
				result: state.result.filter(cUuid => cUuid !== action.character.uuid)
			}
		default:
			return state;
	}
}

export const getTournamentFromState = (state = {}, tournamentSlug) => state[tournamentSlug] || {};
