import log from '../../logger';
import getTournament from './get-tournament';
import getTournamentUsers from './get-tournament-users';
import getTournamentCharacterCount from './get-tournament-character-count';
import updateTournamentUsersDrafting from './update-tournament-users-drafting';
import updateTournamentActive from './update-tournament-active';
import createUpcomingList from './create-upcoming-list';

export default function updateDraftStatus (db, tournamentUuid, cb) {
	getTournament(db, 'uuid', tournamentUuid, (err, tournament) => {
		if (err) {
			return cb(err);
		}
		getTournamentUsers(db, tournamentUuid, (err, tournamentUsers) => {
			if (err) {
				return cb(err);
			}
			// get first user's character count
			getTournamentCharacterCount(db, tournamentUuid, tournamentUsers[0].uuid, (err, user1Count) => {
				if (err) {
					return cb(err)
				}
				// get second user's character count
				getTournamentCharacterCount(db, tournamentUuid, tournamentUsers[1].uuid, (err, user2Count) => {
					if (err) {
						return cb(err)
					}

					let draftingUpdates = {
						user1Uuid: tournamentUsers[0].uuid,
						user2Uuid: tournamentUsers[1].uuid,
						// default state is ending the draft
						user1Drafting: false,
						user2Drafting: false
					};

					if (user1Count < user2Count) {
						draftingUpdates.user1Drafting = true;
					}
					if (user2Count < user1Count) {
						draftingUpdates.user2Drafting = true;
					}
					if (user1Count === user2Count && tournament.charactersPerUser > user1Count) {
						// switch the active drafting player
						draftingUpdates.user1Drafting = !tournamentUsers[0].drafting;
						draftingUpdates.user2Drafting = !tournamentUsers[1].drafting;
					}

					updateTournamentUsersDrafting(db, draftingUpdates, (err, results) => {
						if (err) {
							return cb(err);
						}
						if (draftingUpdates.user1Drafting === true || draftingUpdates.user2Drafting === true) {
							let draftingUuid;
							if (draftingUpdates.user1Drafting) {
								draftingUuid = tournamentUsers[0].uuid
							}
							if (draftingUpdates.user2Drafting) {
								draftingUuid = tournamentUsers[1].uuid
							}
							// don't change active status of tournament if draft is ongoing
							return cb(null, {
								tournamentActive: false,
								drafting: draftingUuid
							});
						}

						log.debug('Draft is over. Creating upcoming list and updating active status of tournament to true', { tournamentUuid });
						getTournamentCharactersQuery(db, tournament.uuid, tournamentUsers[0].uuid, (err, userCharacters) => {
							if (err) {
								return cb(err);
							}
							const userCharacterUuids = userCharacters.forEach(c => c.uuid);

							getTournamentCharactersQuery(db, tournament.uuid, tournamentUsers[1].uuid, (err, opponentCharacters) => {
								if (err) {
									return cb(err);
								}
								const opponentCharacterUuids = opponentCharacters.forEach(c => c.uuid);

								createUpcomingListQuery(req.redis, {
									uuid: tournamentUuid,
									user: {
										uuid: tournamentUsers[0].uuid,
										characters: userCharacterUuids
									},
									opponent: {
										uuid: tournamentUsers[1].uuid,
										characters: opponentCharacterUuids
									}
								}, (err, upcomingData) => {
									if (err) {
										return cb(err);
									}

									updateTournamentActive(db, true, tournamentUuid, (err, results) => {
										if (err) {
											return cb(err);
										}
										return cb(null, {
											tournamentActive: true,
											upcoming: upcomingData
										});
									});
								});
							});
						});
					});
				});
			});
		});
	});
}
