import * as c from '../constants';
import * as api from '../api';

const fetchCharacters = () => {
	return dispatch =>
		api.fetchCharacters()
			.then(
				data => dispatch({
					type: c.FETCH_CHARACTERS_SUCCESS,
					data
				})
			)
}

export default fetchCharacters;
