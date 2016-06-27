import * as api from '../api';
import * as c from '../constants';
import { GENERIC_ERROR } from '../errors';

const submitSeeds = (tournamentSlug, seedValues, token) => dispatch =>
	api.submitSeeds(tournamentSlug, seedValues, token)
		.then(
			body => {
				return dispatch({
					type: c.SUBMIT_SEEDS_SUCCESS,
					tournamentSlug,
					data: body
				})
			},
			error => {
				return dispatch({
					type: c.SUBMIT_SEEDS_FAILURE,
					tournamentSlug,
					data: seedValues,
					reasons: (error && error.reasons) || [GENERIC_ERROR]
				})
			}
		)

export default submitSeeds;
