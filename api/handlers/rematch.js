import log from '../logger';
import r from '../reasons';
import config from '../config';

import getFullTournamentData from '../lib/util/get-full-tournament-data';
import selectTwoRecentGames from '../lib/queries/select-two-recent-games';
import insertRematchQuery from '../lib/queries/insert-rematch';
import undoGame from '../lib/core/undo-game';
import undoGameQuery from '../lib/queries/undo-game';
import undoUpcomingQuery from '../lib/queries/undo-upcoming';

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

		selectTwoRecentGames(req.db, tournament.uuid, (err, gameResults) => {
			if (err) {
				return res.status(500).send(r.internal);
			}
			if (!gameResults.length) {
				return res.status(400).send(r.gameNotFound);
			}
			// if the previous game was already rematched, return an error message
			// because a game can't be re-rematched
			if (gameResults[0].rematched || gameResults[1].rematched) {
				return res.status(400).send(r.rematchAlreadyUsed);
			}
			const game = {
				uuid: gameResults[0].uuid,
				winner: {
					uuid: gameResults[0].winning_player_uuid,
					characterUuid: gameResults[0].winning_character_uuid,
					value: gameResults[0].value,
					streak: gameResults[0].winning_player_previous_streak,
					characterStreak: gameResults[0].winning_character_previous_streak,
					globalStreak: gameResults[0].winning_player_previous_global_streak,
					characterGlobalStreak: gameResults[0].winning_character_previous_global_streak,
				},
				loser: {
					uuid: gameResults[0].losing_player_uuid,
					characterUuid: gameResults[0].losing_character_uuid,
					streak: gameResults[0].losing_player_previous_streak,
					characterStreak: gameResults[0].losing_character_previous_streak,
					globalStreak: gameResults[0].losing_player_previous_global_streak,
					characterGlobalStreak: gameResults[0].losing_character_previous_global_streak,
				},
				supreme: gameResults[0].supreme,
				rematched: gameResults[0].rematched,
				rematchSuccess: gameResults[0].rematchSuccess
			};
			insertRematchQuery(req.db, tournament.uuid, game, req.user.uuid, (err, results) => {
				if (err) {
					return res.status(500).send(r.internal);
				}
				const diff = undoGame(tournament, game, true);

				undoGameQuery(req.db, {
					tournamentUuid: tournament.uuid,
					gameUuid: game.uuid,
					rematch: true
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

						return res.status(200).send(tournament);
					});
				});
			});
		});
	});
}
