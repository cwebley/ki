import log from '../logger';
import r from '../reasons';
import config from '../config';

import getFullTournamentData from '../lib/util/get-full-tournament-data';
import getCharacterQuery from '../lib/queries/get-character';
import oddsmakerQuery from '../lib/queries/use-oddsmaker';

export default function oddsmakerHandler (req, res) {
	if (!req.params.tournamentSlug) {
		return res.status(400).send(r.noSlugParam);
	}
	if (!req.body.characterSlug) {
		return res.status(400).send(r.noCharacterSlug);
	}
	getCharacterQuery(req.db, 'slug', req.body.characterSlug, (err, character) => {
		if (err) {
			return res.status(500).send(r.internal);
		}
		if (!character) {
			return res.status(400).send(r(r.InvalidCharacterSlug(req.body.characterSlug)));
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
			if (tournament.users.ids[req.user.uuid].coins < config.cost.oddsmaker) {
				return res.status(400).send(r.notEnoughCoins);
			}
			if (!tournament.users.ids[req.user.uuid].characters.ids[character.uuid]) {
				return res.status(400).send(r.invalidCharacterSlug);
			}

			oddsmakerQuery(req.db, req.redis, {
				tournamentUuid: tournament.uuid,
				userUuid: req.user.uuid,
				characterUuid: character.uuid,
				oddsmakerLength: config.defaults.oddsmakerLength,
				oddsmakerValue: config.defaults.oddsmakerValue,
				cost: config.cost.oddsmaker
			}, (err, results) => {
				if (err) {
					return res.status(500).send(r.internal);
				}

				tournament.users.ids[req.user.uuid].coins -= config.cost.oddsmaker;
				return res.status(200).send(tournament);
			});
		});
	});
}
