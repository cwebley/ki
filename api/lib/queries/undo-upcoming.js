import log from '../../logger';
import config from '../../config';
import { upcomingList, previousList } from '../util/redis-keys';
import range from 'lodash.range';
import async from 'neo-async';

export default function undoUpcomingQuery (rConn, tournamentState, cb) {

	// pop most recent game off of upcoming list
	let calls = [];
	tournamentState.users.result.forEach(uUuid => {
		calls.push(
			popPush(rConn, tournamentState.uuid, uUuid)
		);
	});
	async.parallel(calls, cb);
}

function popPush (rConn, tournamentUuid, userUuid) {
	return function(done) {
		const previousKey = previousList(tournamentUuid, userUuid);
		const upcomingKey = upcomingList(tournamentUuid, userUuid);

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
