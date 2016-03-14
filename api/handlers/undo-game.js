import log from '../logger';
import r from '../reasons';

import selectMostRecentGame from '../lib/queries/select-most-recent-game';
import undoGame from '../lib/core/undo-game';
import getFullTournamentData from '../lib/util/get-full-tournament-data';
import undoGameQuery from '../lib/queries/undo-game';

export default function undoGameHandler (req, res) {
	if (!req.params.tournamentSlug) {
		return res.status(400).send(r.noSlugParam);
	}

	getFullTournamentData(req.db, req.redis, req.params.tournamentSlug, (err, tournament) => {
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

			undoGameQuery(req.db, tournament.uuid, game.uuid, diff, (err, results) => {
				if (err) {
					return res.status(500).send(r.internal);
				}

				// merge old state and diff
				Object.keys(diff).forEach(tournamentKey => {
					if (tournamentKey === 'users') {
						Object.keys(diff[tournamentKey]).forEach(userUuid => {
							Object.keys(diff[tournamentKey][userUuid]).forEach(userKey => {
								if (userKey === 'characters') {
									Object.keys(diff[tournamentKey][userUuid][userKey]).forEach(cUuid => {
										Object.keys(diff[tournamentKey][userUuid][userKey][cUuid]).forEach(characterKey => {
											tournament[tournamentKey][userUuid][userKey][cUuid][characterKey] = diff[tournamentKey][userUuid][userKey][cUuid][characterKey];
										});
									});
									return;
								}
								tournament[tournamentKey][userUuid][userKey] = diff[tournamentKey][userUuid][userKey];
							});
						});
						return;
					}
					if (tournamentKey === '_remove') {
						tournament.championUuid = null;
					}
				});
				delete tournament._remove;
				return res.status(201).send(tournament);
			});
		});
	});
}
