import nets from 'nets';
import decodeToken from './decodeToken';
import * as c from '../constants';
import * as config from '../config';

export function update (formName, name, value) {
	return {
		type: c.FORM_UPDATE_VALUE,
		formName,
		name,
		value
	};
}

export function reset (formName) {
	return dispatch => dispatch({
		type: c.FORM_RESET,
		formName
	});
}

export function registerUser (data) {
	return dispatch => {
		nets({
			method: 'POST',
			url: config.apiBase + '/api/user/register',
			json: data
		}, (err, resp, body) => {
			if (err || resp.statusCode >= 400) {
				var data;
				if (body && body.reasons) {
					data = body && body.reasons;
				}
				else {
					data = ['An error ocurred'];
				}
				return dispatch({
					type: c.REGISTER_USER_FAILURE,
					data: data
				});
			}

			var token = body && body.token;

			// save token to the store
			dispatch({
				type: c.REGISTER_USER_SUCCESS,
				data: token
			});

			// save token to localStorage for future page visits
			localStorage.setItem('kiToken', token);

			// decode the token and save the user data to the store
			return dispatch(decodeToken(token));
		});
	}
}
