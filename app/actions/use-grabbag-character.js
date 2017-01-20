import * as api from '../api';
import * as c from '../constants';
import clearTournamentReasonsHelper from './clear-tournament-reasons-helper';
import { GENERIC_ERROR } from '../errors';

const useGrabbagCharacter = (tournamentSlug, grabbagData, token) => dispatch =>
	api.useGrabbagCharacter(tournamentSlug, grabbagData, token)
		.then(
			body => {
				return dispatch({
					type: c.USE_GRABBAG_CHARACTER_SUCCESS,
					tournamentSlug,
					grabbagData,
					data: body
				});
			},
			error => {
				clearTournamentReasonsHelper(dispatch, tournamentSlug, error.reasons);

				return dispatch({
					type: c.USE_GRABBAG_CHARACTER_FAILURE,
					tournamentSlug,
					grabbagData,
					reasons: (error && error.reasons) || [GENERIC_ERROR]
				});
			}
		);

export default useGrabbagCharacter;
