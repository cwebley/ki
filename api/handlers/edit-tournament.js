import log from '../logger';
import r from '../reasons';

import getFullTournamentData from '../lib/util/get-full-tournament-data';
import editTournamentQuery from '../lib/queries/edit-tournament';

export default function editTournament (req, res) {
	if (!req.params.tournamentSlug) {
		return res.status(400).send(r.noSlugParam);
	}


	if (!req.body.goal) {
		res.status(400).send(noGoal);
	}
	if (req.body.goal < 1) {
		res.status(400).send(r.invalidGoal);
	}
	let opts = {
		goal: req.body.goal
	};

	getFullTournamentData(req.db, req.redis, {
		tournamentSlug: req.params.tournamentSlug,
		userUuid: req.user.uuid
	}, (err, tournament) => {
		if (err) {
			return res.status(500).send(r.internal);
		}
		if (!tournament) {
			return res.status(404).send(r.tournamentNotFound);
		}
		opts.tournamentUuid = tournament.uuid;

		editTournamentQuery(req.db, opts, (err, results) => {
			if (err) {
				return res.status(500).send(r.internal);
			}
			tournament.goal = opts.goal;
			tournament.championUuid = null;

			return res.status(200).send(tournament);
		});
	});
}