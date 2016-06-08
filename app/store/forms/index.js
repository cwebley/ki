import { combineReducers } from 'redux';
import * as c from '../../constants';

const formReducer = (state = {}, action) => {
	if (!action || !action.formName) {
		return state;
	}
	return {
		[action.formName]: formNameReducer(state[action.formName], action)
	};
}

export default formReducer;

const formNameReducer = (state = {}, action) => {
	switch (action.type) {

	case c.FORM_UPDATE_VALUE:
		return {
			...state,
			values: valuesReducer(state.values, action)
		};
	case c.FORM_UPDATE_LIST:
		return {
			...state,
			values: valuesReducer(state.values, action),
			[action.listName]: listNameReducer(state[action.listName], action)
		};
	case c.DISPLAY_FORM_ERROR:
		return {
			...state,
			reasons: action.reasons
		};
	case c.FORM_RESET:
		return {
			...state,
			values: {}
		};
	default:
		return state;
	}
}

const valuesReducer = (state = {}, action) => {
	switch (action.type) {
	case c.FORM_UPDATE_VALUE:
		return {
			...state,
			[action.name]: action.value
		};
	case c.FORM_UPDATE_LIST:
		return {
			...state,
			[action.listName]: valuesListReducer(state[action.listName], action)
		};
	default:
		return state;
	}
}

const valuesListReducer = (state = [], action) => {
	if (!action.value) {
		// remove the item from the array
		return state.filter(item => item !== action.name)
	}
	// otherwise add the item to the array
	return state.concat(action.name);
}

const listNameReducer = (state = {}, action) => {
	switch (action.type) {
	case c.FORM_UPDATE_LIST:
		return {
			...state,
			[action.name]: action.value
		};
	default:
		return state;
	}
}

export const getFormState = (state = {}, formName) => state[formName] || {};

// careful, this can return undefined
export const getFormValue = (state = {}, fieldName) => {
	return (state.values && state.values[fieldName])
}
