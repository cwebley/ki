import log from '../logger';
import uuid from 'node-uuid';
import r from '../reasons';
import submitGame from '../lib/core/submit-game';

import getFullTournamentData from '../lib/util/get-full-tournament-data';
import submitGameQuery from '../lib/queries/submit-game';
import fillUpcomingListQuery from '../lib/queries/fill-upcoming-list';
import selectMostRecentGame from '../lib/queries/select-most-recent-game';
import decrementInspect from '../lib/queries/decrement-inspect';

export default function submitGameHandler (req, res) {
	if (!req.params.tournamentSlug) {
		return res.status(400).send(r.noSlugParam);
	}

	let opts = {
		winningUserSlug: req.body.winningUserSlug,
		winningCharacterSlug: req.body.winningCharacterSlug,
		losingUserSlug: req.body.losingUserSlug,
		losingCharacterSlug: req.body.losingCharacterSlug,
		supreme: !!req.body.supreme
	};

	let problems = [];
	if (!opts.winningUserSlug) {
		problems.push(r.NoWinningUserSlug);
	}
	if (!opts.winningCharacterSlug) {
		problems.push(r.NoWinningCharacterSlug);
	}
	if (!opts.losingUserSlug) {
		problems.push(r.NoLosingUserSlug);
	}
	if (!opts.losingCharacterSlug) {
		problems.push(r.NoLosingCharacterSlug);
	}
	if (problems.length) {
		return res.status(400).send(r(...problems));
	}

	getFullTournamentData(req.db, req.redis, {
		tournamentSlug: req.params.tournamentSlug,
		userUuid: req.user.uuid,
		// we're going to need the next matchup too
		upcomingAmount: 2
	}, (err, tournament) => {
		if (err) {
			return res.status(500).send(r.internal);
		}
		if (!tournament) {
			return res.status(404).send(r.tournamentNotFound);
		}
		if (tournament.championUuid) {
			return res.status(409).send(r.tournamentAlreadyOver);
		}

		// validate inputs
		// this is a little difficult because we don't have the uuids, only slugs
		let winnerUuid;
		let winningCharacterUuid;
		let loserUuid;
		let losingCharacterUuid;

		tournament.users.result.forEach(uUuid => {
			// check for winner
			if (tournament.users.ids[uUuid].slug === opts.winningUserSlug) {
				winnerUuid = uUuid;

				// if winner found, check for winning character
				tournament.users.ids[uUuid].characters.result.forEach(cUuid => {
					if (tournament.users.ids[uUuid].characters.ids[cUuid].slug === opts.winningCharacterSlug) {
						winningCharacterUuid = cUuid;
					}
				});
			}

			// check for loser
			if (tournament.users.ids[uUuid].slug === opts.losingUserSlug) {
				loserUuid = uUuid;

				// if loser found, check for losing character
				tournament.users.ids[uUuid].characters.result.forEach(cUuid => {
					if (tournament.users.ids[uUuid].characters.ids[cUuid].slug === opts.losingCharacterSlug) {
						losingCharacterUuid = cUuid;
					}
				});
			}
		});

		let problems = [];
		if (!winnerUuid) {
			problems.push(r.InvalidWinningUserSlug);
		}
		// if winnerUuid doesnt exist, then the characters won't either. not really a unique reason.
		if (!winningCharacterUuid && !!winnerUuid) {
			problems.push(r.InvalidWinningCharacterSlug);
		}
		if (!loserUuid) {
			problems.push(r.InvalidLosingUserSlug);
		}
		// if loserUuid doesnt exist, then the characters won't either. not really a unique reason.
		if (!losingCharacterUuid && !!loserUuid) {
			problems.push(r.InvalidLosingCharacterSlug);
		}

		// check that the submitted characters are actually in the current matchup
		if (tournament.users.ids[winnerUuid].upcoming[0].characterUuid !== winningCharacterUuid || tournament.users.ids[loserUuid].upcoming[0].characterUuid !== losingCharacterUuid) {
			problems.push(r.invalidGame);
		}
		if (problems.length) {
			return res.status(400).send(r(...problems));
		}
		selectMostRecentGame(req.db, tournament.uuid, (err, prevGame) => {
			if (err) {
				return res.status(500).send(r.internal);
			}
			log.debug('Done validating inputs, submitting game now');

			// assemble game result
			const game = {
				winner: {
					uuid: winnerUuid,
					characterUuid: winningCharacterUuid
				},
				loser: {
					uuid: loserUuid,
					characterUuid: losingCharacterUuid
				},
				supreme: opts.supreme
			};
			if (prevGame && prevGame.rematched && prevGame.rematchSuccess === null) {
				game.rematchSuccess = (prevGame.rematched === game.winner.uuid) ? true : false;
			}

			let diff = submitGame(tournament, game);

			game.uuid = uuid.v4();
			game.loser.prevStreak = tournament.users.ids[game.loser.uuid].streak;
			game.loser.prevGlobalStreak = tournament.users.ids[game.loser.uuid].globalStreak;
			game.loser.prevCharStreak = tournament.users.ids[game.loser.uuid].characters.ids[game.loser.characterUuid].streak;
			game.loser.prevCharGlobalStreak = tournament.users.ids[game.loser.uuid].characters.ids[game.loser.characterUuid].globalStreak;
			game.winner.value = tournament.users.ids[game.winner.uuid].characters.ids[game.winner.characterUuid].value;
			game.loser.value = tournament.users.ids[game.loser.uuid].characters.ids[game.loser.characterUuid].value;
			game.winner.prevStreak = tournament.users.ids[game.winner.uuid].streak;
			game.winner.prevGlobalStreak = tournament.users.ids[game.winner.uuid].globalStreak;
			game.winner.prevCharStreak = tournament.users.ids[game.winner.uuid].characters.ids[game.winner.characterUuid].streak;
			game.winner.prevCharGlobalStreak = tournament.users.ids[game.winner.uuid].characters.ids[game.winner.characterUuid].globalStreak;

			if (tournament.users.ids[tournament.users.result[0]].upcoming[0].inspectUserUuid) {
				// the submitted game was an inspected one, track its result in the inspect_games table
				// inspectUserUuid is a field placed on both users' upcoming lists if this game was inspected
				game.inspectUserUuid = tournament.users.ids[tournament.users.result[0]].upcoming[0].inspectUserUuid;
			}

			if (tournament.users.ids[tournament.users.result[0]].upcoming[0].oddsmaker) {
				// the submitted game was an oddsmaker one, push this userUuid onto an array of oddsmakerUserUuids
				// it's an array since its possible both users are playing with oddsmaker characters for this game
				game.oddsmakerUserUuids = [tournament.users.result[0]];
			}
			// add the oddsmaker data for the other user if available
			if (tournament.users.ids[tournament.users.result[1]].upcoming[0].oddsmaker) {
				if (!game.oddsmakerUserUuids) {
					game.oddsmakerUserUuids = [];
				}
				game.oddsmakerUserUuids.push(tournament.users.result[1]);
			}

			submitGameQuery(req.db, tournament.uuid, game, diff, (err, updatedCharacterStreaks) => {
				if (err) {
					return res.status(500).send(r.internal);
				}

				fillUpcomingListQuery(req.redis, tournament, (err, results) => {
					if (err) {
						return res.status(500).send(r.internal);
					}

					decrementInspect(req.redis, {
						tournamentUuid: tournament.uuid,
						userUuid: req.user.uuid,
						opponentUuid: tournament.users.result[1]
					}, (err, updatedInspect) => {
						if (err) {
							return res.status(500).send(r.interal);
						}
						tournament.inspect = updatedInspect;

						// merge old state and diff
						Object.keys(diff).forEach(tournamentKey => {
							if (tournamentKey === 'users') {
								diff[tournamentKey].result.forEach(uUuid => {
									Object.keys(diff[tournamentKey].ids[uUuid]).forEach(userKey => {
										if (userKey === 'characters') {
											diff[tournamentKey].ids[uUuid][userKey].result.forEach(cUuid => {
												Object.keys(diff[tournamentKey].ids[uUuid][userKey].ids[cUuid]).forEach(characterKey => {
													tournament[tournamentKey].ids[uUuid][userKey].ids[cUuid][characterKey] = diff[tournamentKey].ids[uUuid][userKey].ids[cUuid][characterKey];
												});
											});
											// characters.result is an array of cUuids ordered by streak. that data was returned from submitGameQuery
											tournament[tournamentKey].ids[uUuid][userKey].result = updatedCharacterStreaks[uUuid];
											return;
										}
										tournament[tournamentKey].ids[uUuid][userKey] = diff[tournamentKey].ids[uUuid][userKey];
									});
								});
								return;
							}
							tournament[tournamentKey] = diff[tournamentKey];
						});

						// the first matchup was this one. return the next matchup.
						tournament.users.result.forEach(uUuid => {
							tournament.users.ids[uUuid].upcoming = tournament.users.ids[uUuid].upcoming.slice(1, 2);
						});
						return res.status(201).send(tournament);
					});
				});
			});
		});
	});
}
