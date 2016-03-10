import uuid from 'node-uuid';
import slug from 'slug';
import bcrypt from 'bcryptjs';

import log from '../logger';
import r from '../reasons';
import submitGame from '../lib/core/submit-game';

import getFullTournamentData from '../lib/util/get-full-tournament-data';
import submitGameQuery from '../lib/queries/submit-game';

export default function submitGameHandler (req, res) {
	if (!req.params.tournamentSlug) {
		return res.status(400).send(r.noSlugParam);
	}

	let opts = {
		winningUserSlug: req.body.winningUserSlug,
		winningCharacterSlug: req.body.winningCharacterSlug,
		losingUserSlug: req.body.losingUserSlug,
		losingCharacterSlug: req.body.losingCharacterSlug
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

	getFullTournamentData(req.db, req.redis, req.params.tournamentSlug, (err, tournament) => {
		if (err) {
			return res.status(500).send(r.internal);
		}
		if (!tournament) {
			return res.status(500).send(r.tournamentNotFound);
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
		if (!winningCharacterUuid) {
			problems.push(r.InvalidWinningCharacterSlug);
		}
		if (!loserUuid) {
			problems.push(r.InvalidLosingUserSlug);
		}
		if (!losingCharacterUuid) {
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
			}
		};

		let diff = submitGame(tournament, game);

		console.log("DIFF: ", JSON.stringify(diff, null, 4));

		submitGameQuery(req.db, tournament.uuid, diff, (err, results) => {
			if (err) {
				return res.status(500).send(r.internal);
			}
			return res.status(201).send('it worked!');
		});
	});
}
