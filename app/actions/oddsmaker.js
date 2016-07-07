import * as api from '../api';
import * as c from '../constants';
import clearTournamentReasonsHelper from './clear-tournament-reasons-helper';
import { GENERIC_ERROR } from '../errors';

const oddsmaker = (character, tournamentSlug, token) => dispatch =>
	api.oddsmaker(character, tournamentSlug, token)
		.then(
			body => {
				return dispatch({
					type: c.ODDSMAKER_SUCCESS,
					character,
					tournamentSlug,
					data: body
				})
			},
			error => {
				clearTournamentReasonsHelper(dispatch, tournamentSlug, error.reasons);

				return dispatch({
					type: c.ODDSMAKER_FAILURE,
					character,
					tournamentSlug,
					reasons: (error && error.reasons) || [GENERIC_ERROR]
				})
			}
		)

export default oddsmaker;
