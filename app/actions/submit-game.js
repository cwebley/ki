import * as api from '../api';
import * as c from '../constants';
import { GENERIC_ERROR } from '../errors';

const submitGame = opts => dispatch =>
	api.submitGame(opts)
		.then(
			body => {
				return dispatch({
					type: c.SUBMIT_GAME_SUCCESS,
					...opts,
					data: body
				})
			},
			error => {
				return dispatch({
					type: c.SUBMIT_GAME_FAILURE,
					...opts,
					reasons: (error && error.reasons) || [GENERIC_ERROR]
				})
			}
		)

export default submitGame;
