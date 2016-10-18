import * as api from '../api';
import * as c from '../constants';
import clearTournamentReasonsHelper from './clear-tournament-reasons-helper';
import { GENERIC_ERROR } from '../errors';

const useInspect = (tournamentSlug, token) => dispatch =>
	api.useInspect(tournamentSlug, token)
		.then(
			body => {
				return dispatch({
					type: c.USE_INSPECT_SUCCESS,
					tournamentSlug,
					data: body
				});
			},
			error => {
				clearTournamentReasonsHelper(dispatch, tournamentSlug, error.reasons);

				return dispatch({
					type: c.USE_INSPECT_FAILURE,
					tournamentSlug,
					reasons: (error && error.reasons) || [GENERIC_ERROR]
				});
			}
		);

export default useInspect;
