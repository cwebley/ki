import * as c from '../constants';
import * as api from '../api';

const fetchTournamentIndex = (token) => {
	console.log("FTI")
	return dispatch =>
		api.fetchTournamentIndex(token)
			.then(
				data => dispatch({
					type: c.FETCH_TOURNAMENT_INDEX_SUCCESS,
					data
				})
			);
};

export default fetchTournamentIndex;
