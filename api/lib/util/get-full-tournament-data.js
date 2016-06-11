import log from '../../logger';
import getTournamentQuery from '../queries/get-tournament';
import getTournamentUsersQuery from '../queries/get-tournament-users';
import getTournamentCharactersQuery from '../queries/get-tournament-characters';
import getUpcomingQuery from '../queries/get-upcoming';

export default function getFullTournamentData (db, rConn, tournamentSlug, upcomingAmount, cb) {
	if (typeof upcomingAmount === 'function') {
		cb = upcomingAmount;
		upcomingAmount = 1;
	}

	// fetch the tournament meta data
	getTournamentQuery(db, 'slug', tournamentSlug, (err, tournament) => {
		if (err) {
			return cb(err);
		}
		if (!tournament) {
			return cb();
		}

		// fetch the meta data for each user in the tournament
		getTournamentUsersQuery(db, tournament.uuid, (err, tournamentUsers) => {
			if (err) {
				return cb(err);
			}
			// results are normalized. result = array of userUuids, ids has the data in a map
			tournament.users = {};
			tournament.users.ids = {};
			let users = [];
			tournamentUsers.forEach(u => {
				tournament.users.ids[u.uuid] = u;
				users.push(u.uuid);
			});

			if (users.length !== 2) {
				err = new Error('2 users not found in tournament');
				log.error(err, tournamentUsers);
				return cb(err);
			}
			tournament.users.result = users;

			/**
			** get meta data from first user
			*/
			getTournamentCharactersQuery(db, tournament.uuid, users[0], (err, tournamentCharacters) => {
				if (err) {
					return cb(err);
				}
				// normalize characters by uuid
				let characters = {};
				let characterIds = [];
				tournamentCharacters.forEach(c => {
					characters[c.uuid] = c;
					characterIds.push(c.uuid);
				});
				// add the first user's character data to the tourament data
				tournament.users.ids[users[0]].characters = {}
				tournament.users.ids[users[0]].characters.ids = characters;
				tournament.users.ids[users[0]].characters.result = characterIds;

				getUpcomingQuery(rConn, {
					tournamentUuid: tournament.uuid,
					userUuid: users[0],
					amount: upcomingAmount
				}, (err, upcomingResults) => {
					if (err) {
						return cb(err);
					}
					tournament.users.ids[users[0]].upcoming = upcomingResults;

					/**
					** get meta data from second user
					*/
					getTournamentCharactersQuery(db, tournament.uuid, users[1], (err, tournamentCharacters) => {
						if (err) {
							return cb(err);
						}
						// normalize characters by uuid
						let characters = {};
						let characterIds = [];
						tournamentCharacters.forEach(c => {
							characters[c.uuid] = c;
							characterIds.push(c.uuid);
						});
						// add the first user's character data to the tourament data
						// results are normalized. result is an array of uuids, ids is a map.
						tournament.users.ids[users[1]].characters = {}
						tournament.users.ids[users[1]].characters.ids = characters;
						tournament.users.ids[users[1]].characters.result = characterIds;

						getUpcomingQuery(rConn, {
							tournamentUuid: tournament.uuid,
							userUuid: users[1]
						}, (err, upcomingResults) => {
							if (err) {
								return cb(err);
							}
							tournament.users.ids[users[1]].upcoming = upcomingResults;


							return cb(null, tournament);
						});
					});
				});
			});
		});
	});
}
