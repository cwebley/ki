import log from '../../logger';
import config from '../../config';
import { upcomingList, inspect, userInspect } from '../util/redis-keys';
import async from 'neo-async';

export default function updateInspectQuery (rConn, opts, cb) {
	let calls = [];

	Object.keys(opts.matchups).forEach(uUuid => {
		calls.push(rearrangeUpcoming(rConn, tournamentUuid, uUuid, opts.matchups[uUuid]));
	});
	async.parallel(calls, cb);
}

const rearrangeUpcoming = (rConn, tournamentUuid, uUuid, upcoming) => (done) => {
	const upcomingKey = upcomingList(opts.tournamentUuid, uUuid);

	// pop off the current match and add it to the front of the inspection list
	rConn.lpop(upcomingKey, (err, currentMatch) => {
		if (err) {
			log.error(err, { upcomingKey })
			done(err);
		}
		upcoming.unshift(currentMatch);

		rConn.ltrim(upcomingKey, upcoming.length, -1, (err, success) => {
			if (err) {
				log.error(err, { upcomingKey })
				return done(err);
			}

			rConn.lpush(upcomingKey, ...upcoming.reverse(), (err, success) => {
				if (err) {
					log.error(err, { upcomingKey });
					return done(err);
				}
				return done(null, success);
			});
		});
	});
};
