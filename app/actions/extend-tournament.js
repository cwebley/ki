import * as api from '../api';
import * as c from '../constants';
import clearTournamentReasonsHelper from './clear-tournament-reasons-helper';
import { GENERIC_ERROR } from '../errors';

const extendTournament = (tournamentSlug, newGoal, token) => dispatch =>
	api.extendTournament(tournamentSlug, newGoal, token)
		.then(
			body => {
				return dispatch({
					type: c.EXTEND_TOURNAMENT_SUCCESS,
					tournamentSlug,
					newGoal,
					data: body
				});
			},
			error => {
				clearTournamentReasonsHelper(dispatch, tournamentSlug, error.reasons);

				return dispatch({
					type: c.EXTEND_TOURNAMENT_FAILURE,
					tournamentSlug,
					newGoal,
					reasons: (error && error.reasons) || [GENERIC_ERROR]
				});
			}
		);

export default extendTournament;
