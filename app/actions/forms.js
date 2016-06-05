import nets from 'nets';
import * as c from '../constants';
import * as config from '../config';
import * as errors from '../errors';
import jwtDecode from 'jwt-decode';
import { saveState } from '../local-storage';
import { constructMe } from '../store/me';
import * as api from '../api';

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
	return dispatch =>
		api.register(data)
			.then(
				loginOrRegisterSuccess(dispatch, formName),
				loginOrRegisterFailure(dispatch, formName)
			)
}

export function signInUser (data, formName) {
	return dispatch =>
		api.login(data)
			.then(
				loginOrRegisterSuccess(dispatch, formName),
				loginOrRegisterFailure(dispatch, formName)
			)
}

// common helper onResolve function for api login/regsiter calls
const loginOrRegisterSuccess = (dispatch, formName) => (body) => {
	const token = body && body.token;
	const decoded = jwtDecode(token);

	dispatch({
		type: c.LOGIN_USER_SUCCESS,
		token: token,
		me: decoded
	});

	// save user data in localStorage future page visits
	const me = constructMe(token, decoded);
	saveState({ me });

	// reset the form after the succesful api hit
	return dispatch(reset(formName));
}

// common helper onReject function for api login/regsiter calls 
const loginOrRegisterFailure = (dispatch, formName) => (error) => {
	dispatch({
		type: c.DISPLAY_FORM_ERROR,
		formName: formName,
		reasons: (error && error.reasons) || [errors.GENERIC_ERROR]
	})
}
