import r from '../reasons';
import getFullTournamentData from '../lib/util/get-full-tournament-data';

export default function getTournamentHandler (req, res) {
	if (!req.params.tournamentSlug) {
		return res.status(400).send(r.noSlugParam);
	}

	// fetch the tournament meta data
	getFullTournamentData(req.db, req.redis, req.params.tournamentSlug, (err, tournament) => {
		if (err) {
			return res.status(500).send(r.internal);
		}
		if (!tournament) {
			return res.status(404).send(r.tournamentNotFound);
		}
		return res.status(200).send(tournament);
	});
}
