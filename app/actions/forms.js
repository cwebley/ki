import nets from 'nets';
import * as c from '../constants';
import * as config from '../config';
import * as errors from '../errors';
import jwtDecode from 'jwt-decode';
import { saveToken } from '../local-storage';

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

export function registerUser (data, formName) {
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
					data = [errors.GENERIC_ERROR];
				}
				return dispatch({
					type: c.DISPLAY_FORM_ERROR,
					formName: formName,
					reasons: data
				});
			}

			var token = body && body.token;

			dispatch({
				type: c.REGISTER_USER_SUCCESS,
				token: token,
				me: jwtDecode(token)
			});

			// save token to localStorage for future page visits
			saveToken(token);

			// reset the form after the succesful api hit
			return dispatch(reset(formName));
		});
	}
}
