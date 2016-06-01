import * as c from './constants';

const initialState = {
	values: {}
};

export default (state = initialState, action) => {
	switch (action.type) {
	case c.FORM_UPDATE_VALUE:
		return (
			Object.assign({}, state, {
				values: Object.assign({}, state.values, {
					[action.name]: action.value
				})
			})
		);
	case c.FORM_RESET:
		return initialState;
	default:
		return state;
	}
}
