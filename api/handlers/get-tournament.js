import r from '../reasons';
import getTournamentQuery from '../lib/queries/get-tournament';
import getTournamentUsersQuery from '../lib/queries/get-tournament-users';
import getTournamentCharactersQuery from '../lib/queries/get-tournament-characters';

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
			let users = [];
			tournamentUsers.forEach(u => {
				tournament.users[u.uuid] = u;
				users.push(u.uuid);
			});

			if (users.length !== 2) {
				err = new Error('2 users not found in tournament');
				log.error(err, tournamentUsers);
				return res.status(500).send(r.internal);
			}


			// get character data from first user
			getTournamentCharactersQuery(req.db, tournament.uuid, users[0], (err, tournamentCharacters) => {
				if (err) {
					return res.status(500).send(r.internal);
				}

				// get character data from second user
				getTournamentCharactersQuery(req.db, tournament.uuid, users[1], (err, tournamentCharacters) => {
					if (err) {
						return res.status(500).send(r.internal);
					}
					return res.status(200).send(tournament);
				});
			});
		});
	});
}
