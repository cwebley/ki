import * as c from '../constants';

export default (state = [], action) => {
	switch (action.type) {
		case c.FETCH_CHARACTERS_SUCCESS:
			return action.data;
		default:
			return state;
	}
};
