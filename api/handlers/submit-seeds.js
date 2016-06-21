import log from '../logger';
import r from '../reasons';

import getFullTournamentData from '../lib/util/get-full-tournament-data';
import submitSeedsQuery from '../lib/queries/submit-seeds';

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
		console.log("T: ", JSON.stringify(tournament, null, 4));

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
		tournament.draft.result.forEach(cUuid => {
			allEligibleCharacterSlugMap[tournament.draft.ids[cUuid].slug] = tournament.draft.ids[cUuid];
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
				console.log("UPDATED TOURNAMENT: ", JSON.stringify(updatedTournament, null, 4))
				if (err) {
					return res.status(500).send(r.internal);
				}
				return res.status(200).send(updatedTournament);
			})
		});
	});
}
