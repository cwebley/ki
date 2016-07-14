import log from '../../logger';
import config from '../../config';
import { upcomingList, previousList } from '../util/redis-keys';
import range from 'lodash.range';
import async from 'neo-async';
import generateUpcomingCharacter from '../util/generate-upcoming-character';

export default function fillUpcomingListQuery (rConn, tournamentState, cb) {
	let calls = [];
	tournamentState.users.result.forEach(uUuid => {
		calls.push(
			popPushAndFill(rConn, tournamentState, uUuid)
		);
	});
	async.parallel(calls, cb);
}

const popPushAndFill = (rConn, tournamentState, uUuid) => done => {
	const upcomingKey = upcomingList(tournamentState.uuid, uUuid);
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
		const previousKey = previousList(tournamentState.uuid, uUuid);
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

				const availableCharUuids = tournamentState.users.ids[uUuid].characters.result;
				const randomCharactersToFill = range(0, slotsToFill).map(() => generateUpcomingCharacter(availableCharUuids));

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
	})
}
