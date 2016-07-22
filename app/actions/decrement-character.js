import * as api from '../api';
import * as c from '../constants';
import clearTournamentReasonsHelper from './clear-tournament-reasons-helper';
import { GENERIC_ERROR } from '../errors';

const decrementCharacter = (character, tournamentSlug, token) => dispatch =>
	api.decrementCharacter(character, tournamentSlug, token)
		.then(
			body => {
				return dispatch({
					type: c.DECREMENT_SUCCESS,
					character,
					tournamentSlug,
					data: body
				})
			},
			error => {
				clearTournamentReasonsHelper(dispatch, tournamentSlug, error.reasons);

				return dispatch({
					type: c.DECREMENT_FAILURE,
					character,
					tournamentSlug,
					reasons: (error && error.reasons) || [GENERIC_ERROR]
				})
			}
		)

export default decrementCharacter;
