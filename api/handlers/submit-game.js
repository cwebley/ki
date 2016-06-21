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

		Object.keys(tournament.users).forEach(u => {
			// check for winner
			if (tournament.users[u].slug === opts.winningUserSlug) {
				winnerUuid = tournament.users[u].uuid;

				// if winner found, check for winning character
				Object.keys(tournament.users[u].characters).forEach(c => {
					if (tournament.users[u].characters[c].slug === opts.winningCharacterSlug) {
						winningCharacterUuid = tournament.users[u].characters[c].uuid;
					}
				});
			}

			// check for loser
			if (tournament.users[u].slug === opts.losingUserSlug) {
				loserUuid = tournament.users[u].uuid;

				// if loser found, check for losing character
				Object.keys(tournament.users[u].characters).forEach(c => {
					if (tournament.users[u].characters[c].slug === opts.losingCharacterSlug) {
						losingCharacterUuid = tournament.users[u].characters[c].uuid;
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
		game.loser.prevStreak = tournament.users[game.loser.uuid].streak;
		game.loser.prevGlobalStreak = tournament.users[game.loser.uuid].globalStreak;
		game.loser.prevCharStreak = tournament.users[game.loser.uuid].characters[game.loser.characterUuid].streak;
		game.loser.prevCharGlobalStreak = tournament.users[game.loser.uuid].characters[game.loser.characterUuid].globalStreak;
		game.winner.value = tournament.users[game.winner.uuid].characters[game.winner.characterUuid].value;
		game.winner.prevStreak = tournament.users[game.winner.uuid].streak;
		game.winner.prevGlobalStreak = tournament.users[game.winner.uuid].globalStreak;
		game.winner.prevCharStreak = tournament.users[game.winner.uuid].characters[game.winner.characterUuid].streak;
		game.winner.prevCharGlobalStreak = tournament.users[game.winner.uuid].characters[game.winner.characterUuid].globalStreak;

		submitGameQuery(req.db, tournament.uuid, game, diff, (err, results) => {
			if (err) {
				return res.status(500).send(r.internal);
			}

			// merge old state and diff
			Object.keys(diff).forEach(tournamentKey => {
				if (tournamentKey === "users") {
					Object.keys(diff[tournamentKey]).forEach(userUuid => {
						Object.keys(diff[tournamentKey][userUuid]).forEach(userKey => {
							if (userKey === "characters") {
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
				if (tournamentKey === "upcoming") {
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
