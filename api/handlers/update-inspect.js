import r from '../reasons';
import getFullTournamentData from '../lib/util/get-full-tournament-data';
import updateInspectQuery from '../lib/queries/update-inspect';

export default function updateInspectHandler (req, res) {
	if (!req.params.tournamentSlug) {
		return res.status(400).send(r.noSlugParam);
	}
	if (!req.body.matchups) {
		return res.status(400).send(r.missingMatchups);
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
		if (!tournament.inspect.users) {
			return res.status(401).send(r.unauthorizedInspect);
		}
		const hydratedUsers = tournament.users.result.map(uUuid => tournament.users.ids[uUuid]);

		// create a map of character slug to character uuids to verify submitted matchups
		let characterSlugToUuid = {};
		hydratedUsers.forEach(u => {
			u.characters.result.forEach(cUuid => {
				characterSlugToUuid[u.characters.ids[cUuid].slug] = cUuid;
			});
		});

		let invalidMatchupUser = false;

		// matchupUuids is just the user and character uuids: {<left-user-uuid>: [<first-character-uuid>, <second-character-uuid>, ... etc]}
		let matchupUuids = {};
		hydratedUsers.forEach(u => {
			if (!req.body.matchups[u.slug]) {
				invalidMatchupUser = true;
				return;
			}
			matchupUuids[u.uuid] = req.body.matchups[u.slug].map(characterSlug => characterSlugToUuid[characterSlug]);
		});

		if (invalidMatchupUser) {
			return res.status(400).send(r.invalidMatchupUser);
		}

		// there are another couple invalid cases here that are ignored.
		// maybe a todo at some point
		if (matchupUuids[tournament.users.result[0]].length !== matchupUuids[tournament.users.result[1]].length) {
			return res.status(400).send(r.invalidMatchups);
		}

		let invalidMatchups = false;

		// hydratedMatchupData will contain the full upcoming object to insert back into redis {<left-user-uuid>: [{uuid: <unique-matchup-uuid>, characterUuid: <character-uuid>, oddsmaker: true}]}
		let hydratedMatchupData = {};
		tournament.users.result.forEach(uUuid => {
			hydratedMatchupData[uUuid] = [];

			// iterate over each submitted character uuid for each user
			matchupUuids[uUuid].forEach(cUuid => {
				// determine that the character is on the inspection list from the server

				let validatedIndex;
				tournament.inspect.users.ids[uUuid].forEach((matchupItem, i) => {
					if (matchupItem.characterUuid === cUuid) {
						validatedIndex = i;
					}
				});
				if (validatedIndex === undefined) {
					// submitted character not found in the inspection list
					invalidMatchups = true;
					return;
				}
				// submitted character found in the list, splice 'em out, add an inspectUserUuid field,
				// and push the full upcoming object into the hydrated data
				let foundMatchup = tournament.inspect.users.ids[uUuid].splice(validatedIndex, 1)[0];
				foundMatchup.inspectUserUuid = req.user.uuid;
				hydratedMatchupData[uUuid].push(foundMatchup);
			});

			// if any characters remain in the inspection list then the submission was invalid
			if (tournament.inspect.users.ids[uUuid].length) {
				invalidMatchups = true;
			}
		});

		if (invalidMatchups) {
			return res.status(400).send(r.invalidMatchups);
		}

		updateInspectQuery(req.redis, {
			tournamentUuid: tournament.uuid,
			matchups: hydratedMatchupData
		}, (err, inspectData) => {
			if (err) {
				return res.status(500).send(r.internal);
			}

			// update the users inspection lists since query was successful
			tournament.inspect.users.ids[tournament.users.result[0]] = hydratedMatchupData[tournament.users.result[0]];
			tournament.inspect.users.ids[tournament.users.result[1]] = hydratedMatchupData[tournament.users.result[1]];

			return res.status(200).send(tournament);
		});
	});
}
