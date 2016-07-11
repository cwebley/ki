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
			...state,
			// reasons should always get initialized to at least an empty array
			reasons: tournamentReasonsReducer(state.reasons, action),
			...action.data,
			draft: draftReducer(state.draft, action)
		};
	case c.SUBMIT_SEEDS_SUCCESS:
	case c.SUBMIT_GAME_SUCCESS:
	case c.REMATCH_SUCCESS:
	case c.ODDSMAKER_SUCCESS:
	case c.DECREMENT_SUCCESS:
		return {
			...state,
			// reasons should always get initialized to at least an empty array
			reasons: tournamentReasonsReducer(state.reasons, action),
			...action.data
		};
	case c.DECREMENT_FAILURE:
	case c.DRAFT_CHARACTER_FAILURE:
	case c.ODDSMAKER_FAILURE:
	case c.REMATCH_FAILURE:
	case c.SUBMIT_GAME_FAILURE:
	case c.SUBMIT_SEEDS_FAILURE:
		return {
			...state,
			reasons: tournamentReasonsReducer(state.reasons, action)
		};
	case c.POP_TOURNAMENT_REASON:
		return {
			...state,
			reasons: tournamentReasonsReducer(state.reasons, action)
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
	case c.TOGGLE_DRAFT_FILTER:
		return {
			...state,
			draft: draftReducer(state.draft, action)
		};
	default:
		return state;
	}
}

const tournamentReasonsReducer = (state = [], action) => {
	if (action.type === c.POP_TOURNAMENT_REASON) {
		return state.slice(1);
	}
	return action.reasons;
}

const tournamentUsersReducer = (state = {}, action) => {
	switch (action.type) {
		case c.DRAFT_CHARACTER_SUCCESS:
			return {
				...state,
				ids: Object.assign({}, state.ids, {
					[state.result[0]]: tournamentUserReducer(state.ids[state.result[0]], action),
					// add a drafting status of true to the right user if appropriate
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
				// keep drafting status on left user is appropriate
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
		case c.FETCH_TOURNAMENT_SUCCESS:
			return {
				...state,
				characters: draftCharactersReducer(state.characters, action)
			};
		case c.DRAFT_CHARACTER_SUCCESS:
			return {
				...state,
				characters: draftCharactersReducer(state.characters, action),
				previous: {
					user: action.userUuid,
					pick: action.data.pick
				},
				current: action.data.drafting
			};
		case c.TOGGLE_DRAFT_FILTER:
			return {
				...state,
				characters: draftCharactersReducer(state.characters, action)
			};
		default:
			return state;
	}
}

const draftCharactersReducer = (state = {}, action) => {

	// default is sorted by left user
	const sortDraftCharactersByRightUser = (rightUuid) => (a, b) => a.users[rightUuid].value < b.users[rightUuid].value ? -1 : 1;

	switch (action.type) {
		case c.FETCH_TOURNAMENT_SUCCESS:
			return {
				...state,
				// if these already exist, don't mess up the client side sorting.
				// otherwise use the data from the action.
				result: (state.result && state.result.length === action.data.draft.characters.result.length) ? state.result : action.data.draft.characters.result,
				ids: state.ids ? state.ids : action.data.draft.characters.ids,
			};
		case c.DRAFT_CHARACTER_SUCCESS:
			return {
				...state,
				result: state.result.filter(cUuid => cUuid !== action.character.uuid)
			}
		case c.TOGGLE_DRAFT_FILTER:
			const filter = (state.filter === 'rightUuid') ? 'leftUuid' : 'rightUuid';
			return {
				...state,
				result: state.result.map(cUuid => state.ids[cUuid]).sort(sortDraftCharactersByRightUser(action[filter])).map(c => c.uuid),
				filter
			}
		default:
			return state;
	}
}

export const getTournamentFromState = (state = {}, tournamentSlug) => state[tournamentSlug] || {};
