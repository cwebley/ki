import * as c from '../constants';

export default (state = {}, action) => {
	switch (action.type) {
	case c.REGISTER_USER_SUCCESS:
		return {
			...state,
			token: action.token,
			...action.me
		};
	default:
		return state;
	}
}
