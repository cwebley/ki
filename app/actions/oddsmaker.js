import * as api from '../api';
import * as c from '../constants';
import clearTournamentReasonsHelper from './clear-tournament-reasons-helper';
import { GENERIC_ERROR } from '../errors';

const oddsmaker = (characterSlug, tournamentSlug, token) => dispatch =>
	api.oddsmaker(characterSlug, tournamentSlug, token)
		.then(
			body => {
				return dispatch({
					type: c.ODDSMAKER_SUCCESS,
					characterSlug,
					tournamentSlug,
					data: body
				});
			},
			error => {
				clearTournamentReasonsHelper(dispatch, tournamentSlug, error.reasons);

				return dispatch({
					type: c.ODDSMAKER_FAILURE,
					characterSlug,
					tournamentSlug,
					reasons: (error && error.reasons) || [GENERIC_ERROR]
				});
			}
		);

export default oddsmaker;
