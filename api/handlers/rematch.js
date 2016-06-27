import log from '../logger';
import r from '../reasons';
import config from '../config';

import getFullTournamentData from '../lib/util/get-full-tournament-data';
import selectMostRecentGame from '../lib/queries/select-most-recent-game';
import undoGame from '../lib/core/undo-game';

export default function rematchHandler (req, res) {
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
		if (tournament.users.ids[req.user.uuid].coins < config.cost.rematch) {
			return res.status(400).send(r.notEnoughCoins);
		}

		selectMostRecentGame(req.db, tournament.uuid, (err, game) => {
			if (err) {
				return res.status(500).send(r.internal);
			}
			if (!game) {
				return res.status(400).send(r.gameNotFound);
			}
			// if the previous game was already rematched, return an error message
			// because a game can't be re-rematched
			if (game.rematched) {
				return res.status(400).send(r.rematchAlreadyUsed);
			}

			return res.status(200).send();

		});
	});
}
