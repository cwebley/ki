import r from '../reasons';
import getTournamentQuery from '../lib/queries/get-tournament';
import getTournamentUsersQuery from '../lib/queries/get-tournament-users';

export default function getTournamentHandler (req, res) {
	if (!req.params.tournamentSlug) {
		return res.status(400).send(r.noSlugParam);
	}

	getTournamentQuery(req.db, 'slug', req.params.tournamentSlug, (err, tournament) => {
		if (err) {
			return res.status(500).send(r.internal);
		}
		if (!tournament) {
			return res.status(404).send(r.tournamentNotFound);
		}

		getTournamentUsersQuery(req.db, tournament.uuid, (err, tournamentUsers) => {
			if (err) {
				return res.status(500).send(r.internal);
			}
			tournament.users = {};
			tournamentUsers.forEach((u) => {
				tournament.users[u.uuid] = u;
			});
			return res.status(200).send(tournament);
		});
	});
}
