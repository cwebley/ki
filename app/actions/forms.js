import nets from 'nets';
import * as c from '../constants';
import * as config from '../config';
import * as errors from '../errors';
import jwtDecode from 'jwt-decode';
import { saveState } from '../local-storage';
import { constructMe } from '../store/me';
import * as api from '../api';

export function update (data) {
	const { formName, name, value } = data;
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

export function updateList (data) {
	const { formName, listName, name, value } = data;
	return {
		type: c.FORM_UPDATE_LIST,
		formName,
		listName,
		name,
		value
	};
}

export function toggleListItems (data) {
	return {
		type: c.TOGGLE_LIST_ITEMS,
		formName: data.formName,
		toggleName: data.toggleName,
		listName: data.listName,
		items: data.items,
		on: data.on
	};
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

	// save user data in localStorage future page visits
	const me = constructMe(token, decoded);
	saveState({ me });

	// reset the form after the succesful api hit
	dispatch(reset(formName));

	return dispatch({
		type: c.LOGIN_USER_SUCCESS,
		token: token,
		me: decoded
	});
}

// common helper onReject function for api login/regsiter calls
const loginOrRegisterFailure = (dispatch, formName) => (error) => {
	return dispatch({
		type: c.DISPLAY_FORM_ERROR,
		formName: formName,
		reasons: (error && error.reasons) || [errors.GENERIC_ERROR]
	})
}
