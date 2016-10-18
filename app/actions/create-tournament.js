import * as api from '../api';
import * as c from '../constants';
import { GENERIC_ERROR } from '../errors';
import clearFormReasonsHelper from './clear-form-reasons-helper';

const createTournament = (data, token, formName) => dispatch =>
	api.createTournament(data, token)
		.then(
			body => {
				return dispatch({
					type: c.CREATE_TOURNAMENT_SUCCESS,
					data: body
				});
			},
			error => {
				clearFormReasonsHelper(dispatch, formName, error.reasons);

				return dispatch({
					type: c.CREATE_TOURNAMENT_FAILURE,
					formName,
					data,
					reasons: (error && error.reasons) || [GENERIC_ERROR]
				});
			}
		);

export default createTournament;
