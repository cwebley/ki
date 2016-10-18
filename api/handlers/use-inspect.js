import r from '../reasons';
import config from '../config';
import getFullTournamentData from '../lib/util/get-full-tournament-data';
import useInspectQuery from '../lib/queries/use-inspect';

export default function useInpsectHandler (req, res) {
	if (!req.params.tournamentSlug) {
		return res.status(400).send(r.noSlugParam);
	}

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
		if (!tournament.inspect.available) {
			return res.status(409).send(r.inspectNotAvailable);
		}
		if (tournament.users.ids[req.user.uuid].coins < config.cost.inspect) {
			return res.status(400).send(r.notEnoughCoins);
		}

		useInspectQuery(req.db, req.redis, {
			tournamentUuid: tournament.uuid,
			userUuid: req.user.uuid,
			opponentUuid: tournament.users.result[1],
			cost: config.cost.inspect,
			inspectLength: config.defaults.inspectLength
		}, (err, inspectData) => {
			if (err) {
				return res.status(500).send(r.internal);
			}
			if (!inspectData) {
				// another user grabbed inspect first
				return res.status(409).send(r.inspectNotAvailable);
			}

			// update the users coin stock since the purchase was successful
			tournament.users.ids[req.user.uuid].coins -= config.cost.inspect;

			return res.status(201).send(inspectData);
		});
	});
}
