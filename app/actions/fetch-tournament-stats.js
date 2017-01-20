import * as c from '../constants';
import * as api from '../api';

const fetchTournamentStats = (tournamentSlug, token) => {
	return dispatch =>
		api.fetchTournamentStats(tournamentSlug, token)
			.then(
				data => dispatch({
					type: c.FETCH_TOURNAMENT_STATS_SUCCESS,
					tournamentSlug,
					data
				})
			);
};

export default fetchTournamentStats;
