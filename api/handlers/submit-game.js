import log from '../logger';
import uuid from 'node-uuid';
import r from '../reasons';
import submitGame from '../lib/core/submit-game';

import getFullTournamentData from '../lib/util/get-full-tournament-data';
import submitGameQuery from '../lib/queries/submit-game';
import fillUpcomingListQuery from '../lib/queries/fill-upcoming-list';

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
		userUuid: req.user.uuid
	}, (err, tournament) => {
		if (err) {
			return res.status(500).send(r.internal);
		}
		if (!tournament) {
			return res.status(404).send(r.tournamentNotFound);
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
		if (problems.length) {
			return res.status(400).send(r(...problems));
		}

		log.debug('Done validating inputs, submitting game now');

		//assemble game result
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

		let diff = submitGame(tournament, game);

		game.uuid = uuid.v4();
		game.loser.prevStreak = tournament.users.ids[game.loser.uuid].streak;
		game.loser.prevGlobalStreak = tournament.users.ids[game.loser.uuid].globalStreak;
		game.loser.prevCharStreak = tournament.users.ids[game.loser.uuid].characters.ids[game.loser.characterUuid].streak;
		game.loser.prevCharGlobalStreak = tournament.users.ids[game.loser.uuid].characters.ids[game.loser.characterUuid].globalStreak;
		game.winner.value = tournament.users.ids[game.winner.uuid].characters.ids[game.winner.characterUuid].value;
		game.winner.prevStreak = tournament.users.ids[game.winner.uuid].streak;
		game.winner.prevGlobalStreak = tournament.users.ids[game.winner.uuid].globalStreak;
		game.winner.prevCharStreak = tournament.users.ids[game.winner.uuid].characters.ids[game.winner.characterUuid].streak;
		game.winner.prevCharGlobalStreak = tournament.users.ids[game.winner.uuid].characters.ids[game.winner.characterUuid].globalStreak;

		submitGameQuery(req.db, tournament.uuid, game, diff, (err, results) => {
			if (err) {
				return res.status(500).send(r.internal);
			}

			// merge old state and diff
			Object.keys(diff).forEach(tournamentKey => {
				if (tournamentKey === "users") {
					diff[tournamentKey].result.forEach(uUuid => {
						Object.keys(diff[tournamentKey].ids[uUuid]).forEach(userKey => {
							if (userKey === "characters") {
								diff[tournamentKey].ids[uUuid][userKey].result.forEach(cUuid => {
									Object.keys(diff[tournamentKey].ids[uUuid][userKey].ids[cUuid]).forEach(characterKey => {
										tournament[tournamentKey].ids[uUuid][userKey].ids[cUuid][characterKey] = diff[tournamentKey].ids[uUuid][userKey].ids[cUuid][characterKey];
									});
								});
								return;
							}
							tournament[tournamentKey].ids[uUuid][userKey] = diff[tournamentKey].ids[uUuid][userKey];
						});
					});
					return;
				}
				if (tournamentKey === "upcoming") {
					debugger;
					tournament[tournamentKey].upcoming.splice(0, 1);
				}
				tournament[tournamentKey] = diff[tournamentKey];
			});

			fillUpcomingListQuery(req.redis, tournament, (err, results) => {
				if (err) {
					return res.status(500).send(r.internal);
				}
				return res.status(201).send(tournament);
			});
		});
	});
}
