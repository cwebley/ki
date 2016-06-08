import * as api from '../api';
import * as c from '../constants';
import { GENERIC_ERROR } from '../errors';

const createTournament = (data, token, formName) => dispatch => {
		api.createTournament(data, token)
			.then(
				body => {
					return dispatch({
						type: c.CREATE_TOURNAMENT_SUCCESS,
						data: body
					})
				},
				error => {
					return dispatch({
						type: c.CREATE_TOURNAMENT_FAILURE,
						formName: formName,
						data: data,
						reasons: (error && error.reasons) || [GENERIC_ERROR]
					})
				}
			)
}

export default createTournament;
