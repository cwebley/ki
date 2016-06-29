import log from '../logger';
import r from '../reasons';

import selectMostRecentGame from '../lib/queries/select-most-recent-game';
import undoGame from '../lib/core/undo-game';
import getFullTournamentData from '../lib/util/get-full-tournament-data';
import undoGameQuery from '../lib/queries/undo-game';
import undoUpcomingQuery from '../lib/queries/undo-upcoming';

export default function undoGameHandler (req, res) {
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

		selectMostRecentGame(req.db, tournament.uuid, (err, game) => {
			if (err) {
				return res.status(500).send(r.internal);
			}
			if (!game) {
				return res.status(400).send(r.gameNotFound);
			}

			let diff = undoGame(tournament, game);

			undoGameQuery(req.db, {
				tournamentUuid: tournament.uuid,
				gameUuid: game.uuid,
			}, diff, (err, results) => {
				if (err) {
					return res.status(500).send(r.internal);
				}

				// merge old state and diff
				Object.keys(diff).forEach(tournamentKey => {
					if (tournamentKey === 'users') {
						diff[tournamentKey].result.forEach(userUuid => {
							Object.keys(diff[tournamentKey].ids[userUuid]).forEach(userKey => {
								if (userKey === 'characters') {
									diff[tournamentKey].ids[userUuid][userKey].result.forEach(cUuid => {
										Object.keys(diff[tournamentKey].ids[userUuid][userKey].ids[cUuid]).forEach(characterKey => {
											tournament[tournamentKey].ids[userUuid][userKey].ids[cUuid][characterKey] = diff[tournamentKey].ids[userUuid][userKey].ids[cUuid][characterKey];
										});
									});
									return;
								}
								tournament[tournamentKey].ids[userUuid][userKey] = diff[tournamentKey].ids[userUuid][userKey];
							});
						});
						return;
					}
					if (tournamentKey === '_remove') {
						if (diff[tournamentKey].championUuid) {
							tournament.championUuid = null;
						}
					}
				});
				delete tournament._remove;

				undoUpcomingQuery(req.redis, tournament, (err, results) => {
					if (err) {
						return res.status(500).send(r.internal);
					}
					return res.status(201).send(tournament);
				});
			});
		});
	});
}
