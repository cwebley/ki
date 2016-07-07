import log from '../logger';
import r from '../reasons';
import config from '../config';

import getFullTournamentData from '../lib/util/get-full-tournament-data';
import getCharacterQuery from '../lib/queries/get-character';
import decrementCharacterQuery from '../lib/queries/decrement-character';

export default function decrementCharacterHandler (req, res) {
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
			return res.status(400).send(r.invalidCharacterSlug);
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
			if (tournament.users.ids[req.user.uuid].coins < config.cost.decrement) {
				return res.status(400).send(r.notEnoughCoins);
			}
			// make sure the character actually owned by the opponent
			if (!tournament.users.ids[tournament.users.result[1]].characters.ids[character.uuid]) {
				return res.status(400).send(r.invalidCharacterSlug);
			}
			// don't allow this action if character value is already 1
			if (tournament.users.ids[tournament.users.result[1]].characters.ids[character.uuid].value <= 1) {
				return res.status(400).send(r.characterValueAtOne);
			}
			
			decrementCharacterQuery(req.db, {
				tournamentUuid: tournament.uuid,
				characterUuid: character.uuid,
				userUuid: tournament.users.result[0],
				opponentUuid: tournament.users.result[1],
				cost: config.cost.decrement
			}, (err, results) => {
				if (err) {
					return res.status(500).send(r.internal);
				}

				tournament.users.ids[tournament.users.result[1]].characters.ids[character.uuid].value -= 1;
				tournament.users.ids[tournament.users.result[1]].characters.ids[character.uuid].rawValue -= 1;
				tournament.users.ids[req.user.uuid].coins -= config.cost.decrement;
				return res.status(200).send(tournament);
			});
		});
	});
}
