import * as api from '../api';
import * as c from '../constants';
import clearTournamentReasonsHelper from './clear-tournament-reasons-helper';
import { GENERIC_ERROR } from '../errors';

const rematch = (tournamentSlug, token) => dispatch =>
	api.rematch(tournamentSlug, token)
		.then(
			body => {
				return dispatch({
					type: c.REMATCH_SUCCESS,
					tournamentSlug,
					data: body
				});
			},
			error => {
				clearTournamentReasonsHelper(dispatch, tournamentSlug, error.reasons);

				return dispatch({
					type: c.REMATCH_FAILURE,
					tournamentSlug,
					reasons: (error && error.reasons) || [GENERIC_ERROR]
				});
			}
		);

export default rematch;
