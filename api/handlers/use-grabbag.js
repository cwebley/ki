import r from '../reasons';
import config from '../config';
import getFullTournamentData from '../lib/util/get-full-tournament-data';
import useGrabbagQuery from '../lib/queries/use-grabbag';

export default function useGrabBagHandler (req, res) {
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
		if (tournament.users.ids[req.user.uuid].coins < config.cost.grabbag) {
			return res.status(400).send(r.notEnoughCoins);
		}

		useGrabbagQuery(req.db, req.redis, {
			tournamentUuid: tournament.uuid,
			userUuid: req.user.uuid,
			characterUuids: tournament.users.ids[req.user.uuid].characters.result,
			cost: config.cost.grabbag,
			grabbagChoiceCount: config.defaults.grabbagChoiceCount
		}, (err, grabbagData) => {
			if (err) {
				return res.status(500).send(r.internal);
			}

			return res.status(201).send({
				grabbag: grabbagData,
				coins: tournament.users.ids[req.user.uuid].coins - config.cost.grabbag
			});
		});
	});
}
