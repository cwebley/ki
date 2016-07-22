import log from '../../logger';
import getInspect from './get-inspect';
import { inspect, userInspect, userUpcomingList } from '../util/redis-keys';

export default function decrementInpsect (rConn, opts, cb) {
	const inspectKey = inspect(opts.tournamentUuid);

	rConn.get(inspectKey, (err, inspectUuid) => {
		if (err) {
			log.error({ inspectKey });
			return cb(err);
		}

		// no one is inspecting, nothing to decr
		if (!inspectUuid) {
			return cb(null, {
				available: true
			});
		}

		const userInspectKey = userInspect(opts.tournamentUuid, inspectUuid);

		rConn.decr(userInspectKey, (err, gamesRemaining) => {
			if (err) {
				log.error({ userInspect });
				return cb(err);
			}
			if (parseInt(gamesRemaining, 10) >= 0) {
				return getInspect(rConn, opts, cb);
			}

			// if this inspect run is now over, clear the key and make it available
			rConn.del(inspectKey, (err, success) => {
				if (err) {
					log.error({ inspectKey });
					return cb(err)
				}
				return cb(null, {
					available: true
				});
			});
		});
	});
}
