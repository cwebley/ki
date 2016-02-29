import r from '../reasons';
import slug from 'slug';
import uuid from 'node-uuid';
import createTournamentQuery from '../lib/queries/create-tournament';
import getUserQuery from '../lib/queries/get-user';
import getCharactersQuery from '../lib/queries/get-characters';
import getUserCharactersQuery from '../lib/queries/get-user-characters';
import config from '../config';

export default function createTournamentHandler (req, res) {
	let tournamentOpts = {
		name: req.body.name,
		goal: parseInt(req.body.goal, 10) || config.defaults.goal,
		startCoins: parseInt(req.body.startingStock, 10) || config.defaults.startCoins
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
	if (!tournamentOpts.startCoins) {
		problems.push(r.NoStartCoins);
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
			if (err) {
				return res.status(500).send(r.internal);
			}

			// all characters for each user. this will probably change.
			tournamentOpts.user.characters = characters;
			tournamentOpts.opponent.characters = characters;

			// this is used to help determine what rows need to be added in user_characters
			let characterUuids = characters.map((c) => { return c.uuid });

			// fetch user_characters for the first player
			// if any don't exist, we'll need insert these rows in create tournament
			getUserCharactersQuery(req.db, tournamentOpts.user.uuid, characterUuids, (err, userCharacterUuids) => {
				if (err) {
					return res.status(500).send(r.internal);
				}

				// now we actually find out which user_character rows need to be added for user
				// if the character isn't in our userCharacterUuids array, return it. it needs to be added.
				let userCharactersToAdd = characterUuids.filter(c => userCharacterUuids.indexOf(c) === -1);
				tournamentOpts.user.userCharactersToAdd = userCharactersToAdd;

				// fetch user_characters for the second player
				getUserCharactersQuery(req.db, tournamentOpts.opponent.uuid, characterUuids, (err, opponentCharacterUuids) => {
					if (err) {
						return res.status(500).send(r.internal);
					}

					// which user_character rows to add for the opponent
					let opponentCharactersToAdd = characterUuids.filter(c => opponentCharacterUuids.indexOf(c) === -1);
					tournamentOpts.opponent.userCharactersToAdd = opponentCharactersToAdd;

					createTournamentQuery(req.db, tournamentOpts, (err, tournament) => {
						if (err) {
							if (err.message.slice(0, 9) === 'duplicate' && err.message.indexOf('tournaments_name_key') !== -1) {
								return res.status(409).send(r.duplicateTournamentName);
							}
							return res.status(500).send(r.internal);
						}
						return res.status(201).send(tournament);
					});
				});
			});
		});
	});
}
