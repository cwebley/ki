import * as c from '../constants';
import get from 'lodash.get';

export default (state = {}, action) => {
	switch (action.type) {
	case c.FORM_UPDATE_VALUE:
		return {
			...state,
			[action.formName]: {
				...state[action.formName],
				values: {
					...get(state[action.formName], 'values', {}),
					[action.name]: action.value
				}
			}
		};
	case c.DISPLAY_FORM_ERROR:
		return {
			...state,
			[action.formName]: {
				...state[action.formName],
				reasons: action.reasons
			}
		};
	case c.FORM_RESET:
		return {
			// Object.assign({}, state, {
			// 	[action.formName]: {}
			// })
			...state,
			[action.formName]: {
				...state[action.formName],
				values: {}
			}
		};
	default:
		return state;
	}
}
