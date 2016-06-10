import r from '../reasons';
import slug from 'slug';
import uuid from 'node-uuid';
import createTournamentQuery from '../lib/queries/create-tournament';
import getUserQuery from '../lib/queries/get-user';
import getCharactersQuery from '../lib/queries/get-characters';
import getUserCharactersQuery from '../lib/queries/get-user-characters';
import createUpcomingListQuery from '../lib/queries/create-upcoming-list';
import config from '../config';

export default function createTournamentHandler (req, res) {
	let tournamentOpts = {
		name: req.body.name,
		goal: parseInt(req.body.goal, 10) || config.defaults.goal,
		startCoins: parseInt(req.body.startingStock, 10) || config.defaults.startCoins,

		// charactersPerUser: req.body.charactersPerUser,
		// maxStartingValue: req.body.maxStartingValue
	};

	req.body.myCharacters = req.body.myCharacters || [];
	req.body.opponentCharacters = req.body.opponentCharacters || [];
	req.body.draftCharacters = req.body.draftCharacters || [];

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
	if (!req.body.charactersPerUser) {
		problems.push(r.NoCharactersPerUser);
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
	if (!Array.isArray(req.body.myCharacters)) {
		problems.push(r.InvalidMyCharacters);
	}
	if (!Array.isArray(req.body.opponentCharacters)) {
		problems.push(r.InvalidMyCharacters);
	}
	if (!Array.isArray(req.body.draftCharacters)) {
		problems.push(r.InvalidMyCharacters);
	}
	if (problems.length) {
		return res.status(400).send(r(...problems));
	}

	// dedup the character arrays
	let myCharObj = {};
	let oppCharObj = {};
	let draftCharObj = {};
	req.body.myCharacters.forEach(char => {myCharObj[char] = true});
	req.body.opponentCharacters.forEach(char => {oppCharObj[char] = true});
	req.body.draftCharacters.forEach(char => {draftCharObj[char] = true});
	req.body.myCharacters = Object.keys(myCharObj);
	req.body.opponentCharacters = Object.keys(oppCharObj);
	req.body.draftCharacters = Object.keys(draftCharObj);

	const charDifference = Math.abs(req.body.myCharacters.length - req.body.opponentCharacters.length);
	const moreCharacters = Math.max(req.body.myCharacters.length, req.body.opponentCharacters.length);

	if ((req.body.charactersPerUser.length > (Math.floor(req.body.draftCharacters.length - charDifference) / 2) + charDifference) ||
		req.body.charactersPerUser.length < req.body.myCharacters.length ||
		req.body.charactersPerUser.length < req.body.opponentCharacters.length) {
		return res.status(400).send(r.invalidCharactersPerUser);
	}

	// fetch opponent data
	getUserQuery(req.db, 'slug', req.body.opponentSlug, (err, opponentData) => {
		if (err) {
			return res.status(500).send(r.internal);
		}
		if (!opponentData) {
			return res.status(400).send(r.invalidOpponentSlug);
		}

		tournamentOpts.uuid = uuid.v4();
		tournamentOpts.slug = slug(tournamentOpts.name);

		tournamentOpts.opponent = {};
		tournamentOpts.user = {};
		tournamentOpts.draft = {};

		tournamentOpts.opponent.uuid = opponentData.uuid;
		tournamentOpts.user.uuid = req.user.uuid;

		getCharactersQuery(req.db, (err, characters) => {
			if (err) {
				return res.status(500).send(r.internal);
			}

			// verify all the inputted character arrays are real characters and return any invalid ones
			let characterUuidFromSlug = {};
			characters.forEach(c => {
				characterUuidFromSlug[c.slug] = c.uuid;
			});

			const invalidMyCharacters = [];
			const invalidOpponentCharacters = [];
			const invalidDraftCharacters = [];

			const myCharacterUuids = req.body.myCharacters.map(c => {
				if (!characterUuidFromSlug[c]) {
					invalidMyCharacters.push(c);
				}
				return characterUuidFromSlug[c];
			});
			const opponentCharacterUuids = req.body.opponentCharacters.map(c => {
				if (!characterUuidFromSlug[c]) {
					invalidOpponentCharacters.push(c);
				}
				return characterUuidFromSlug[c];
			});
			const draftCharacterUuids = req.body.draftCharacters.map(c => {
				if (!characterUuidFromSlug[c]) {
					invalidDraftCharacters.push(c);
				}
				return characterUuidFromSlug[c];
			});

			if (invalidMyCharacters.length) {
				problems.push(r.MyCharacterNotFound(invalidMyCharacters));
			}
			if (invalidOpponentCharacters.length) {
				problems.push(r.OpponentCharacterNotFound(invalidOpponentCharacters));
			}
			if (invalidDraftCharacters.length) {
				problems.push(r.DraftCharacterNotFound(invalidDraftCharacters));
			}
			if (problems.length) {
				return res.status(400).send(r(...problems));
			}

			tournamentOpts.user.characters = myCharacterUuids;
			tournamentOpts.opponent.characters = opponentCharacterUuids;
			tournamentOpts.draft.characters = draftCharacterUuids;

			// this is used to help determine what rows need to be added in user_characters
			let characterUuids = characters.map(c => c.uuid);

			// fetch user_characters for the first player
			// if any don't exist, we'll need insert these rows in create tournament
			getUserCharactersQuery(req.db, tournamentOpts.user.uuid, characterUuids, (err, availableUserCharacterUuids) => {
				if (err) {
					return res.status(500).send(r.internal);
				}

				// now we actually find out which user_character rows need to be added for user
				// if the character isn't in our availableUserCharacterUuids array, return it. it needs to be added.
				const userCharactersToAdd = characterUuids.filter(c => availableUserCharacterUuids.indexOf(c) === -1);
				tournamentOpts.user.userCharactersToAdd = userCharactersToAdd;

				// fetch user_characters for the second player
				getUserCharactersQuery(req.db, tournamentOpts.opponent.uuid, characterUuids, (err, availableOpponentCharacterUuids) => {
					if (err) {
						return res.status(500).send(r.internal);
					}

					// which user_character rows to add for the opponent
					const opponentCharactersToAdd = characterUuids.filter(c => availableOpponentCharacterUuids.indexOf(c) === -1);
					tournamentOpts.opponent.userCharactersToAdd = opponentCharactersToAdd;

					createTournamentQuery(req.db, tournamentOpts, (err, tournament) => {
						if (err) {
							if (err.message.slice(0, 9) === 'duplicate' && err.message.indexOf('tournaments_name_key') !== -1) {
								return res.status(409).send(r.duplicateTournamentName);
							}
							return res.status(500).send(r.internal);
						}

						createUpcomingListQuery(req.redis, tournamentOpts, (err, results) => {
							if (err) {
								return res.status(500).send(r.internal);
							}
							return res.status(201).send(tournament);
						});
					});
				});
			});
		});
	});
}
