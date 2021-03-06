import r from '../reasons';
import getTournamentStatsQuery from '../lib/queries/get-tournament-stats';

export default function getTournamentStats (req, res) {
	getTournamentStatsQuery(req.db, req.params.tournamentSlug, (err, tournamentStatsData) => {
		if (err) {
			return res.status(500).send(r.internal);
		}
		if (!tournamentStatsData) {
			return res.status(404).send(r.tournamentNotfound);
		}

		return res.status(200).send(tournamentStatsData);
	});
}
