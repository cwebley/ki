import * as c from '../constants';
import * as api from '../api';

const fetchTournament = (tournamentSlug, token) => {
	return dispatch =>
		api.fetchTournament(tournamentSlug, token)
			.then(
				data => dispatch({
					type: c.FETCH_TOURNAMENT_SUCCESS,
					tournamentSlug,
					data
				})
			)
}

export default fetchTournament;
