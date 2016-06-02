import * as c from '../constants';
import * as config from '../config';
import nets from 'nets';

import jwtDecode from 'jwt-decode';


export function update (name, value) {
	return {
		type: c.FORM_UPDATE_VALUE,
		name,
		value
	};
}

export function reset () {
	return dispatch => dispatch({
		type: c.FORM_RESET
	});
}

export function registerUser (data) {
	return dispatch => {
		nets({
			method: 'POST',
			url: config.apiBase + '/api/user/register',
			json: data
		}, (err, resp, body) => {
			var decoded = jwtDecode(body.token);
			return dispatch({
				type: c.REGISTER_USER_SUCCESS,
				user: body
			});
		});
	}
}
