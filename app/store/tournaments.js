import * as c from '../constants';

const tournamentsReducer = (state = {}, action) => {
	switch (action.type) {
		case c.FETCH_TOURNAMENT_INDEX_SUCCESS:
			return {
				...state,
				tournaments: [...action.data]
			};
		case c.FETCH_TOURNAMENT_STATS_SUCCESS:
			return {
				...state,
				tournamentStats: tournamentStatsReducer(state.tournamentStats, action)
			};
		default:
			if (!action || !action.tournamentSlug) {
				return state;
			}
			return {
				[action.tournamentSlug]: tournamentReducer(state[action.tournamentSlug], action)
			};
	}
};

export default tournamentsReducer;

const tournamentReducer = (state = {}, action) => {
	switch (action.type) {
		case c.FETCH_TOURNAMENT_SUCCESS:
		case c.UPDATE_MATCHUPS_SUCCESS:
			return {
				...state,
			// reasons should always get initialized to at least an empty array
				reasons: tournamentReasonsReducer(state.reasons, action),
				...action.data,
				draft: draftReducer(state.draft, action),
				inspect: inspectReducer(state.inspect, action)
			};
		case c.SUBMIT_SEEDS_SUCCESS:
		case c.SUBMIT_GAME_SUCCESS:
		case c.REMATCH_SUCCESS:
		case c.ODDSMAKER_SUCCESS:
		case c.DECREMENT_SUCCESS:
		case c.UNDO_LAST_GAME_SUCCESS:
		case c.EXTEND_TOURNAMENT_SUCCESS:
			return {
				...state,
			// reasons should always get initialized to at least an empty array
				reasons: tournamentReasonsReducer(state.reasons, action),
				...action.data
			};
		case c.DECREMENT_FAILURE:
		case c.DRAFT_CHARACTER_FAILURE:
		case c.ODDSMAKER_FAILURE:
		case c.UNDO_LAST_GAME_FAILURE:
		case c.USE_INSPECT_FAILURE:
		case c.REMATCH_FAILURE:
		case c.SUBMIT_GAME_FAILURE:
		case c.SUBMIT_SEEDS_FAILURE:
		case c.UPDATE_MATCHUPS_FAILURE:
		case c.EXTEND_TOURNAMENT_FAILURE:
		case c.PURCHASE_GRABBAG_FAILURE:
		case c.USE_GRABBAG_CHARACTER_FAILURE:
			return {
				...state,
				reasons: tournamentReasonsReducer(state.reasons, action)
			};
		case c.POP_TOURNAMENT_REASON:
			return {
				...state,
				reasons: tournamentReasonsReducer(state.reasons, action)
			};
		case c.USE_INSPECT_SUCCESS:
			return {
				...state,
				reasons: tournamentReasonsReducer(state.reasons, action),
				inspect: inspectReducer(state.inspect, action)
			};
		case c.PURCHASE_GRABBAG_SUCCESS:
			return {
				...state,
				reasons: tournamentReasonsReducer(state.reasons, action),
				// also update the coins and grabbag with the value returned in action.data
				users: tournamentUsersReducer(state.users, action)
			};
		case c.USE_GRABBAG_CHARACTER_SUCCESS:
			return {
				...state,
				reasons: tournamentReasonsReducer(state.reasons, action),
				// update the grabbag and upcoming fields
				users: tournamentUsersReducer(state.users, action)
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
		case c.UPDATE_INSPECT_STATE:
			return {
				...state,
				inspect: inspectReducer(state.inspect, action)
			};
		default:
			return state;
	}
};

const inspectReducer = (state = {}, action) => {
	switch (action.type) {
		case c.USE_INSPECT_SUCCESS:
			return action.data;
		case c.UPDATE_INSPECT_STATE:
			return {
				...state,
				custom: customInspectReducer(state.custom, action)
			};
		case c.UPDATE_MATCHUPS_SUCCESS:
			return {
				...action.data.inspect,
				custom: customInspectReducer(state.custom, action)
			};
		case c.FETCH_TOURNAMENT_SUCCESS:
			let customInspect = customInspectReducer(state.custom, action);

			if (state.custom && action.data.inspect.users) {
				const leftUserUuid = state.users.result[0];
				const rightUserUuid = state.users.result[1];

				if ((state.custom[leftUserUuid] && state.custom[leftUserUuid].length > action.data.inspect.users.ids[leftUserUuid].length) ||
				(state.custom[rightUserUuid] && state.custom[rightUserUuid].length > action.data.inspect.users.ids[rightUserUuid].length)) {
					// one of our custom lists is too long, a matchup was probably submitted
					// wipe the custom lists to refresh the data
					customInspect = {};
				}
			}
			return {
				...action.data.inspect,
				custom: customInspect
			};
		default:
			return state;
	}
};

const customInspectReducer = (state = {}, action) => {
	switch (action.type) {
		case c.UPDATE_INSPECT_STATE:
			return {
				...state,
				[action.userUuid]: action.data
			};
		case c.UPDATE_MATCHUPS_SUCCESS:
			// previously edited matchups became the official matchups on the server
			return {};
		case c.FETCH_TOURNAMENT_SUCCESS:
			return state;
		default:
			return state;
	}
};

const tournamentReasonsReducer = (state = [], action) => {
	if (action.type === c.POP_TOURNAMENT_REASON) {
		return state.slice(1);
	}
	if (action.reasons) {
		return [...state, ...action.reasons];
	}
	return state;
};

const tournamentUsersReducer = (state = {}, action) => {
	switch (action.type) {
		case c.DRAFT_CHARACTER_SUCCESS:
			return {
				...state,
				ids: Object.assign({}, state.ids, {
					[state.result[0]]: {
						...tournamentUserReducer(state.ids[state.result[0]], action),
						upcoming: action.data.upcoming ? [action.data.upcoming[0]] : []
					},
					// add a drafting status of true to the right user if appropriate
					[state.result[1]]: {
						...state.ids[state.result[1]],
						drafting: action.data.drafting === state.result[1],
						upcoming: action.data.upcoming ? [action.data.upcoming[1]] : []
					}
				})
			};
		case c.PURCHASE_GRABBAG_SUCCESS:
			return {
				...state,
				ids: Object.assign({}, state.ids, {
					[state.result[0]]: {
						...tournamentUserReducer(state.ids[state.result[0]], action)
					}
				})
			};
		case c.USE_GRABBAG_CHARACTER_SUCCESS:
			return {
				...state,
				ids: Object.assign({}, state.ids, {
					[state.result[0]]: {
						...tournamentUserReducer(state.ids[state.result[0]], action)
					}
				})
			};
		default:
			return state;
	}
};

const tournamentUserReducer = (state = {}, action) => {
	switch (action.type) {
		case c.DRAFT_CHARACTER_SUCCESS:
			return {
				...state,
				characters: userCharactersReducer(state.characters, action),
				// keep drafting status on left user is appropriate
				drafting: action.data.drafting === state.uuid
			};
		case c.PURCHASE_GRABBAG_SUCCESS:
			return {
				...state,
				coins: action.data.coins,
				grabbag: action.data.grabbag
			};
		case c.USE_GRABBAG_CHARACTER_SUCCESS:
			return {
				...state,
				grabbag: [...action.data.grabbag],
				// update just the current match with the new grabbag match returned from the server
				upcoming: [action.data.upcomingMatch, ...state.upcoming.slice(1)]
			};
		default:
			return state;
	}
};

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
};

const userCharacterReducer = (state = {}, action) => {
	switch (action.type) {
		case c.DRAFT_CHARACTER_SUCCESS:
			const { users, ...commonCharacterData } = action.character;
			return {
				...commonCharacterData,
				wins: 0,
				losses: 0,
				streak: 0,
				bestStreak: 0,
				fireWins: 0,
				...users[action.userUuid]
			};
		default:
			return state;
	}
};

const draftReducer = (state = {}, action) => {
	switch (action.type) {
		case c.FETCH_TOURNAMENT_SUCCESS:
			return {
				...state,
				...action.data.draft,
				characters: draftCharactersReducer(state.characters, action)
			};
		case c.DRAFT_CHARACTER_SUCCESS:
			return {
				...state,
				characters: draftCharactersReducer(state.characters, action),
				previous: {
					userUuid: action.userUuid,
					characterUuid: action.character.uuid,
					value: action.data.value,
					pick: action.data.pick
				},
				current: action.data.current,
				total: action.data.total
			};
		case c.TOGGLE_DRAFT_FILTER:
			return {
				...state,
				characters: draftCharactersReducer(state.characters, action)
			};
		default:
			return state;
	}
};

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
				ids: action.data.draft.characters.ids
			};
		case c.DRAFT_CHARACTER_SUCCESS:
			return {
				...state,
				result: state.result.filter(cUuid => cUuid !== action.character.uuid)
			};
		case c.TOGGLE_DRAFT_FILTER:
			const filter = (state.filter === 'rightUuid') ? 'leftUuid' : 'rightUuid';
			return {
				...state,
				result: state.result.map(cUuid => state.ids[cUuid]).sort(sortDraftCharactersByRightUser(action[filter])).map(c => c.uuid),
				filter
			};
		default:
			return state;
	}
};

const tournamentStatsReducer = (state = {}, action) => {
	if (action.type === c.FETCH_TOURNAMENT_STATS_SUCCESS) {
		return {
			...state,
			[action.tournamentSlug]: tournamentStatsTournamentReducer(state[action.tournamentSlug], action)
		};
	}
	return state;
};

const tournamentStatsTournamentReducer = (state = {}, action) => {
	if (action.type === c.FETCH_TOURNAMENT_STATS_SUCCESS) {
		return {
			...state,
			...action.data
		};
	}
	return state;
};

export const getTournamentFromState = (state = {}, tournamentSlug) => state[tournamentSlug] || {};
export const getTournamentIndexFromState = (state = {}) => state.tournaments || [];
export const getTournamentStatsFromState = (state = {}, tournamentSlug) => state.tournamentStats && state.tournamentStats[tournamentSlug] || {};
export const getTournamentActiveFromState = (state = {}, tournamentSlug) => state[tournamentSlug] && state[tournamentSlug].active || false;

export const getFirstUserCoinsFromState = (state = {}, tournamentSlug) => {
	let usersData = state[tournamentSlug] && state[tournamentSlug].users;
	if (!usersData) {
		return 0;
	}
	return usersData.ids[usersData.result[0]] && usersData.ids[usersData.result[0]].coins;
};
export const getFirstUserGrabbagFromState = (state = {}, tournamentSlug) => {
	let usersData = state[tournamentSlug] && state[tournamentSlug].users;
	if (!usersData) {
		return {};
	}
	return usersData.ids[usersData.result[0]] && usersData.ids[usersData.result[0]].grabbag || [];
};
export const getFirstUserCharactersFromState = (state = {}, tournamentSlug) => {
	let usersData = state[tournamentSlug] && state[tournamentSlug].users;
	if (!usersData) {
		return [];
	}

	return usersData.ids[usersData.result[0]] && usersData.ids[usersData.result[0]].characters && usersData.ids[usersData.result[0]].characters.ids;
};
