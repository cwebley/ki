import emailValidator from 'email-validator';
import *  as e from '../errors';

export function required (value) {
	return !value ? [e.TEXT_REQUIRED] : [];
}

export function email (value) {
	if (!value) {
		return [];
	}
	return !emailValidator.validate(value) ? [e.INVALID_EMAIL] : [];
}
