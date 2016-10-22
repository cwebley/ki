import emailValidator from 'email-validator';
import * as e from '../errors';

export function required (value) {
	return !value ? [e.TEXT_REQUIRED] : [];
}

export function email (value) {
	if (!value) {
		return [];
	}
	return !emailValidator.validate(value) ? [e.INVALID_EMAIL] : [];
}

export function passwordLength (value) {
	if (!value) {
		return [];
	}

	if (value.length >= 6 && value.length <= 25) {
		return [];
	}
	return [e.PASSWORD_LENGTH];
}

export function titleLength (value) {
	if (value.length > 25) {
		return [e.TITLE_LENGTH];
	}
}
