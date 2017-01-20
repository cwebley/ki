import * as api from '../api';
import * as c from '../constants';
import clearTournamentReasonsHelper from './clear-tournament-reasons-helper';
import { GENERIC_ERROR } from '../errors';

const purchaseGrabbag = (tournamentSlug, token) => dispatch =>
	api.purchaseGrabbag(tournamentSlug, token)
		.then(
			body => {
				return dispatch({
					type: c.PURCHASE_GRABBAG_SUCCESS,
					tournamentSlug,
					data: body
				});
			},
			error => {
				clearTournamentReasonsHelper(dispatch, tournamentSlug, error.reasons);

				return dispatch({
					type: c.PURCHASE_GRABBAG_FAILURE,
					tournamentSlug,
					reasons: (error && error.reasons) || [GENERIC_ERROR]
				});
			}
		);

export default purchaseGrabbag;
