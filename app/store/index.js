import { combineReducers } from 'redux';
import forms, * as fromForms from './forms/index';
import me from './me';
import characters from './characters';

export default combineReducers({
	me,
	forms,
	characters,
});

export const getCharactersFromState = (state) => state.characters || [];

export const getMe = (state) => state.me || {};

export const getFormState = (state, formName) => fromForms.getFormState(state.forms, formName);
