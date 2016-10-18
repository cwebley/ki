import * as c from '../constants';
import { saveState } from '../local-storage';

export default () => {
	return dispatch => {
		// clear the saved user state from localStorage
		saveState(undefined);

		return dispatch({
			type: c.LOGOUT
		});
	};
};
