import * as api from '../api';
import * as c from '../constants';
import clearTournamentReasonsHelper from './clear-tournament-reasons-helper';
import { GENERIC_ERROR } from '../errors';

const updateMatchups = (tournamentSlug, matchupData, token) => dispatch =>
	api.updateMatchups(tournamentSlug, matchupData, token)
		.then(
			body => {
				return dispatch({
					type: c.UPDATE_MATCHUPS_SUCCESS,
					tournamentSlug,
					data: body
				});
			},
			error => {
				clearTournamentReasonsHelper(dispatch, tournamentSlug, error.reasons);

				return dispatch({
					type: c.UPDATE_MATCHUPS_FAILURE,
					tournamentSlug,
					matchupData,
					reasons: (error && error.reasons) || [GENERIC_ERROR]
				});
			}
		);

export default updateMatchups;
