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
		// if user is logged in and in the tournament, make sure they are the first user returned
		if (req.user && req.user.uuid) {
			const userIndex = tournament.users.result.indexOf(req.user.uuid);
			if (userIndex === 1) {
				// logged in user in the second position, reverse the order
				tournament.users.result.reverse();
			}
		}
		return res.status(200).send(tournament);
	});
}
