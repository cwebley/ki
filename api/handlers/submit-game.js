import uuid from 'node-uuid';
import slug from 'slug';
import bcrypt from 'bcryptjs';

import log from '../logger';
import r from '../reasons';

import getFullTournamentData from '../lib/util/get-full-tournament-data';

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
		let winningUserFound = false;
		let winningCharacterFound = false;
		let losingUserFound = false;
		let losingCharacterFound = false;

		Object.keys(tournament.users).forEach(u => {
			// check for winner
			if (tournament.users[u].slug === opts.winningUserSlug) {
				winningUserFound = true;

				// if winner found, check for winning character
				Object.keys(tournament.users[u].characters).forEach(c => {
					if (tournament.users[u].characters[c].slug === opts.winningCharacterSlug) {
						winningCharacterFound = true;
					}
				});
			}

			// check for loser
			if (tournament.users[u].slug === opts.losingUserSlug) {
				losingUserFound = true;

				// if loser found, check for losing character
				Object.keys(tournament.users[u].characters).forEach(c => {
					if (tournament.users[u].characters[c].slug === opts.losingCharacterSlug) {
						losingCharacterFound = true;
					}
				});
			}
		});

		let problems = [];
		if (!winningUserFound) {
			problems.push(r.InvalidWinningUserSlug);
		}
		if (!winningCharacterFound) {
			problems.push(r.InvalidWinningCharacterSlug);
		}
		if (!losingUserFound) {
			problems.push(r.InvalidLosingUserSlug);
		}
		if (!losingCharacterFound) {
			problems.push(r.InvalidLosingCharacterSlug);
		}
		if (problems.length) {
			return res.status(400).send(r(...problems));
		}

		console.log("DONE VALIDATING NO PROBS")
		return res.status(201).send('it worked!');
	});
}
