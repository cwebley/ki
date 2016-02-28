import r from '../reasons';
import slug from 'slug';
import uuid from 'node-uuid';
import createTournamentQuery from '../lib/queries/create-tournament';
import getUserQuery from '../lib/queries/get-user';
import getCharactersQuery from '../lib/queries/get-characters';

export default function createTournamentHandler (req, res) {
	let tournamentOpts = {
		name: req.body.name,
		goal: parseInt(req.body.goal, 10)
	}

	let problems = [];
	if (!tournamentOpts.name) {
		problems.push(r.NoName);
	}
	if (!req.body.opponentSlug) {
		problems.push(r.NoOpponentSlug);
	}
	if (!tournamentOpts.goal) {
		problems.push(r.NoGoal);
	}
	if (problems.length) {
		return res.status(400).send(r(...problems));
	}

	if (tournamentOpts.name.length > 25) {
		problems.push(r.InvalidName);
	}
	if (tournamentOpts.goal < 1) {
		problems.push(r.InvalidGoal);
	}
	if (problems.length) {
		return res.status(400).send(r(...problems));
	}

	// fetch opponent data
	getUserQuery(req.db, 'slug', req.body.opponentSlug, (err, opponentData) => {
		if (err) {
			return res.status(500).send(r.internal);
		}
		if (!opponentData) {
			return res.status(400).send(r.InvalidOpponentSlug);
		}

		tournamentOpts.uuid = uuid.v4();
		tournamentOpts.slug = slug(tournamentOpts.name);

		tournamentOpts.opponent = {};
		tournamentOpts.user = {};

		tournamentOpts.opponent.uuid = opponentData.uuid;
		tournamentOpts.user.uuid = req.user.uuid;

		getCharactersQuery(req.db, (err, characters) => {
			console.log("CHARS: ", err, characters);
			if (err) {
				return res.status(500).send(r.internal);
			}

			// all characters for each user. this will probably change.
			tournamentOpts.user.characters = characters;
			tournamentOpts.opponent.characters = characters;

			createTournamentQuery(req.db, tournamentOpts, (err, tournament) => {
				if (err) {
					if (err.message.slice(0, 9) === 'duplicate') {
						return res.status(409).send(r.duplicateTournamentName);
					}
					return res.status(500).send(r.internal);
				}
				return res.status(201).send(tournament);
			});
		});
	});

}
