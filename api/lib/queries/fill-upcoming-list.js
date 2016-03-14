import log from '../../logger';
import config from '../../config';
import { upcomingList, previousList } from '../util/redis-keys';
import range from 'lodash.range';
import async from 'neo-async';

export default function fillUpcomingListQuery (rConn, tournamentState, cb) {
	// check length of upcomingList for each user
	// start assembling a user object that will ultimately contain uuid and characterUuids
	let users = Object.keys(tournamentState.users).map(uuid => {
		return { uuid }
	});

	// pop most recent game off of upcoming list
	let calls = [];
	users.forEach(user => {
		calls.push(
			popPushAndFill(rConn, tournamentState, user.uuid)
		);
	});
	async.parallel(calls, cb);
}

function popPushAndFill (rConn, tournamentState, userUuid) {
	return function(done) {
		const upcomingKey = upcomingList(tournamentState.uuid, userUuid);
		rConn.lpop(upcomingKey, (err, charUuid) => {
			if (err) {
				log.error(err, { key: upcomingKey });
				return done(err);
			}
			if (!charUuid) {
				log.debug('lpop returned no result', {
					key: upcomingKey
				});
				return done();
			}
			// push onto previous list
			const previousKey = previousList(tournamentState.uuid, userUuid);
			rConn.lpush(previousKey, charUuid, (err, success) => {
				if (err) {
					log.error(err, { key: previousKey, value: charUuid });
					return done(err);
				}
				if (!success) {
					log.debug('lpush failed', {
						key: previousKey, value: charUuid
					});
					return done();
				}

				// get length of upcomingList so we know how much to fill
				rConn.llen(upcomingKey, (err, len) => {
					if (err) {
						log.error(err, { key: upcomingKey });
						return done(err);
					}
					let slotsToFill = config.defaults.upcomingListLength - len;

					if (slotsToFill < 1) {
						log.debug('No slots to fill', {
							upcomingListLength: len,
							key: upcomingKey
						});
						return done();
					}

					const availableCharUuids = Object.keys(tournamentState.users[userUuid].characters);
					const randomCharactersToFill = range(0, slotsToFill).map(() => {
						return availableCharUuids[Math.floor(Math.random() * availableCharUuids.length)];
					});

					rConn.rpush(upcomingKey, ...randomCharactersToFill, (err, success) => {
						if (err) {
							log.error(err, {
								key: upcomingKey,
								values: randomCharactersToFill
							});
							return done(err);
						}
						if (!success) {
							log.debug('rpush failed', {
								key: upcomingKey,
								values: randomCharactersToFill
							});
							return done();
						}
						return done(null, success);
					});
				});
			});
		});
	}
}
