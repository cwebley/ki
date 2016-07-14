import log from '../../logger';
import config from '../../config';
import { upcomingList, inspect, userInspect } from '../util/redis-keys';
import decrementCoins from './decrement-coins';

export default function useInspectQuery (db, rConn, opts, cb) {
	const userUpcomingKey = upcomingList(opts.tournamentUuid, opts.userUuid);
	const opponentUpcomingKey = upcomingList(opts.tournamentUuid, opts.opponentUuid);
	const inspectKey = inspect(opts.tournamentUuid);
	const userInspectKey = userInspect(opts.tournamentUuid, opts.userUuid);

	rConn.setnx(inspectKey, opts.userUuid, (err, success) => {
		if (err) {
			return cb(err);
		}

		if (!success) {
			// the other user snagged this power first, return empty
			return cb();
		}

		rConn.set(userInspectKey, opts.inspectLength, (err, success) => {
			if (err) {
				return cb(err);
			}

			decrementCoins(db, opts.tournamentUuid, opts.userUuid, opts.cost, (err, results) => {
				if (err) {
					// already logged
					return cb(err);
				}

				// get one extra since we're not actually inspecting the current matchup
				rConn.lrange(userUpcomingKey, 1, opts.inspectLength + 1, (err, userUpcomingCharacters) => {
					if (err) {
						log.error(err, { userUpcomingKey })
						return cb(err);
					}

					// get one extra since we're not actually inspecting the current matchup
					rConn.lrange(opponentUpcomingKey, 1, opts.inspectLength + 1, (err, opponentUpcomingCharacters) => {
						if (err) {
							log.error(err, { opponentUpcomingKey })
							return cb(err);
						}

						return cb(null, {
							available: false,
							remaining: opts.inspectLength,
							users: {
								ids: {
									[opts.userUuid]: userUpcomingCharacters,
									[opts.opponentUpcomingKey]: opponentUpcomingCharacters
								},
								result: [opts.userUuid, opts.opponentUuid]
							}
						});
					});
				});
			});
		});
	});
}
