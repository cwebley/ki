import log from '../../logger';
import config from '../../config';
import { upcomingList, previousList } from '../util/redis-keys';
import range from 'lodash.range';
import async from 'neo-async';

export default function undoUpcomingQuery (rConn, tournamentState, cb) {
	// check length of upcomingList for each user
	// start assembling a user object that will ultimately contain uuid and characterUuids
	let users = Object.keys(tournamentState.users).map(uuid => {
		return { uuid }
	});

	// pop most recent game off of upcoming list
	let calls = [];
	users.forEach(user => {
		calls.push(
			popPush(rConn, tournamentState, user.uuid)
		);
	});
	async.parallel(calls, cb);
}

function popPush (rConn, tournamentState, userUuid) {
	return function(done) {
		const previousKey = previousList(tournamentState.uuid, userUuid);
		const upcomingKey = upcomingList(tournamentState.uuid, userUuid);
		// pop most recent item from previous list
		rConn.lpop(previousKey, (err, charUuid) => {
			if (err) {
				log.error(err, { key: previousKey });
				return done(err);
			}
			if (!charUuid) {
				log.debug('lpop returned no result', {
					key: previousKey
				});
				return done();
			}
			// push onto front of upcoming list
			rConn.lpush(upcomingKey, charUuid, (err, success) => {
				if (err) {
					log.error(err, { key: upcomingKey, value: charUuid });
					return done(err);
				}
				if (!success) {
					log.debug('lpush failed', {
						key: upcomingKey, value: charUuid
					});
					return done();
				}
				return done(null, success);
			});
		});
	}
}
