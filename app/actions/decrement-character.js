import * as api from '../api';
import * as c from '../constants';
import clearTournamentReasonsHelper from './clear-tournament-reasons-helper';
import { GENERIC_ERROR } from '../errors';

const decrementCharacter = (characterSlug, tournamentSlug, token) => dispatch =>
	api.decrementCharacter(characterSlug, tournamentSlug, token)
		.then(
			body => {
				return dispatch({
					type: c.DECREMENT_SUCCESS,
					characterSlug,
					tournamentSlug,
					data: body
				})
			},
			error => {
				clearTournamentReasonsHelper(dispatch, tournamentSlug, error.reasons);

				return dispatch({
					type: c.DECREMENT_FAILURE,
					characterSlug,
					tournamentSlug,
					reasons: (error && error.reasons) || [GENERIC_ERROR]
				})
			}
		)

export default decrementCharacter;
