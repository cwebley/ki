import * as c from '../constants';

export default (state = {}, action) => {
	switch (action.type) {
		case c.LOGIN_USER_SUCCESS:
			return constructMe(action.token, action.me);
		case c.LOGOUT:
			return {};
		default:
			return state;
	}
};

// saving 'me' to localStorage requires knowledge of how 'me' is built
export const constructMe = (token, me) => ({
	token,
	...me
});
