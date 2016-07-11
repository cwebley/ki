import log from '../logger';
import r from '../reasons';

import getFullTournamentData from '../lib/util/get-full-tournament-data';
import submitSeedsQuery from '../lib/queries/submit-seeds';
import assignFirstDraftPick from '../lib/queries/assign-first-draft-pick';
import createUpcomingListQuery from '../lib/queries/create-upcoming-list';
import updateTournamentActive from '../lib/queries/update-tournament-active';

export default function submitGameHandler (req, res) {
	if (!req.params.tournamentSlug) {
		return res.status(400).send(r.noSlugParam);
	}

	if (!req.body || !Array.isArray(req.body) || !req.body.length) {
		res.status(400).send(r.noSeeds);
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

		// dedup seed data and make sure nothing changed
		let seededSlugMap = {};
		req.body.forEach(cSlug => { seededSlugMap[cSlug] = true });
		const dedupedSeedSlugs = Object.keys(seededSlugMap);
		if (req.body.length !== dedupedSeedSlugs.length) {
			return res.status(400).send(r.duplicateSeed);
		}

		// make sure all eligible characters are seeded
		const opponentCharacters = tournament.users.ids[tournament.users.result[1]].characters;
		let allEligibleCharacterSlugMap = {};

		opponentCharacters.result.forEach(cUuid => {
			allEligibleCharacterSlugMap[opponentCharacters.ids[cUuid].slug] = opponentCharacters.ids[cUuid];
		});
		tournament.draft.characters.result.forEach(cUuid => {
			allEligibleCharacterSlugMap[tournament.draft.characters.ids[cUuid].slug] = tournament.draft.characters.ids[cUuid];
		});

		if (req.body.length !== Object.keys(allEligibleCharacterSlugMap).length) {
			return res.status(400).send(r.missingCharacterSeeds);
		}

		// validate all submitted seeds and assemble seedUuids into an array for query opts
		let invalidSeeds = [];
		let seedUuids = [];
		req.body.forEach(cSlug => {
			if (!allEligibleCharacterSlugMap[cSlug]) {
				invalidSeeds.push(cSlug);
				return;
			}
			seedUuids.push(allEligibleCharacterSlugMap[cSlug].uuid)
		});
		if (invalidSeeds.length) {
			return res.status(400).send(r.invalidSeeds(invalidSeeds));
		}

		const opts = {
			tournamentUuid: tournament.uuid,
			maxStartingValue: tournament.maxStartingValue,
			userUuid: req.user.uuid,
			opponentUuid: tournament.users.result[1],
			seeds: seedUuids,
			// also need to track the non draft characters here since their values can be added directly to the db now
			opponentCharacters: opponentCharacters.ids
		}

		submitSeedsQuery(req.db, opts, (err, results) => {
			if (err) {
				if (err.message.slice(0, 9) === 'duplicate' && err.message.indexOf('seeds_pkey') !== -1) {
					return res.status(409).send(r.seedsAlreadySubmitted)
				}
				return res.status(500).send(r.internal);
			}

			// seeding successful, return the up-to-date tournament data
			getFullTournamentData(req.db, req.redis, {
				tournamentSlug: req.params.tournamentSlug,
				userUuid: req.user.uuid
			}, (err, updatedTournament) => {
				if (err) {
					return res.status(500).send(r.internal);
				}

				// if the other user still needs to seed, don't assign a first pick. return the tournament
				if (!updatedTournament.users.ids[updatedTournament.users.result[1]].seeded) {
					return res.status(200).send(updatedTournament);
				}

				const user1CharLen = updatedTournament.users.ids[updatedTournament.users.result[0]].characters.result.length;
				const user2CharLen = updatedTournament.users.ids[updatedTournament.users.result[1]].characters.result.length;

				// if there is no draft, no need to assign first pick.
				if (user1CharLen === updatedTournament.charactersPerUser && user2CharLen === updatedTournament.charactersPerUser) {
					return kickStartTournament(req, res, updatedTournament);
				}

				let firstPickUuid;

				// user 1 gets first pick if they have less characters
				if (user1CharLen < user2CharLen) {
					firstPickUuid = updatedTournament.users.result[0];
				}
				// user 2 gets first pick if they have less characters
				else if (user2CharLen < user1CharLen) {
					firstPickUuid = updatedTournament.users.result[1];
				}
				// if they have the same amount of characters, assign the first pick randomly
				else {
					firstPickUuid = updatedTournament.users.result[Math.floor(Math.random() * 2)];
				}


				assignFirstDraftPick(req.db, updatedTournament.uuid, firstPickUuid, (err, results) => {
					if (err) {
						return res.status(500).send(r.internal);
					}

					// update the drafting field from the tournament data without refetching everything
					updatedTournament.users.ids[firstPickUuid].drafting = true;
					return res.status(200).send(updatedTournament);
				});
			})
		});
	});
}

// there won't be a draft. load the upcoming matches then set the tournament to active and return the updatedTournament
const kickStartTournament = (req, res, updatedTournament) => {
	createUpcomingListQuery(req.redis, {
		uuid: updatedTournament.uuid,
		user: {
			uuid: updatedTournament.users.result[0],
			characters: updatedTournament.users.ids[updatedTournament.users.result[0]].characters.result
		},
		opponent: {
			uuid: updatedTournament.users.result[1],
			characters: updatedTournament.users.ids[updatedTournament.users.result[1]].characters.result
		}
	}, (err, upcomingData) => {
		if (err) {
			return res.status(500).send(r.internal);
		}
		updatedTournament.users.ids[updatedTournament.users.result[0]].upcoming = upcomingData[updatedTournament.users.result[0]].slice(0, 1);
		updatedTournament.users.ids[updatedTournament.users.result[1]].upcoming = upcomingData[updatedTournament.users.result[1]].slice(0, 1);

		updateTournamentActive(req.db, true, updatedTournament.uuid, (err, results) => {
			if (err) {
				return res.status(500).send(r.internal);
			}
			updatedTournament.active = true;
			return res.status(200).send(updatedTournament);
		});
	});
}
