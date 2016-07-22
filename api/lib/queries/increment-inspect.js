import log from '../../logger';
import { inspect, userInspect } from '../util/redis-keys';
import getInspect from './get-inspect';

export default function incrementInspectQuery (rConn, opts, cb) {
	const inspectKey = inspect(opts.tournamentUuid);

	rConn.get(inspectKey, (err, inspectUserUuid) => {
		if (err) {
			log.error(err, { key: inspectKey });
			return cb(err);
		}
		if (!inspectUserUuid) {
			// we can return empty since nothing changed here
			return cb();
		}

		const gamesRemainingKey = userInspect(opts.tournamentUuid, inspectUserUuid);
		rConn.incr(gamesRemainingKey, (err, gamesRemaining) => {
			if (err) {
				log.error(err, { key: gamesRemainingKey });
				return cb(err);
			}
			if (inspectUserUuid !== opts.userUuid) {
				// the opponent is inspecting, we've incremented the count, and now we're done
				return cb(null, {
					available: false,
					remaining: parseInt(gamesRemaining, 10)
				});
			}

			// this user is inspecting, we need to fetch an up to date upcoming list
			return getInspect(rConn, opts, cb);
		});
	});
}
