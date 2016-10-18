import log from '../../logger';
import config from '../../config';
import { upcomingList, inspect, userInspect } from '../util/redis-keys';
import decrementCoins from './decrement-coins';

export default function useInspectQuery (db, rConn, opts, cb) {
	opts.userUpcomingKey = upcomingList(opts.tournamentUuid, opts.userUuid);
	opts.opponentUpcomingKey = upcomingList(opts.tournamentUuid, opts.opponentUuid);
	opts.inspectKey = inspect(opts.tournamentUuid);
	opts.userInspectKey = userInspect(opts.tournamentUuid, opts.userUuid);

	rConn.setnx(opts.inspectKey, opts.userUuid, (err, success) => {
		if (err) {
			return cb(err);
		}

		if (success) {
			return claimAndProcessInspect(db, rConn, opts, cb);
		}

		// the other user owns the power
		// this user can still claim the power if there are 0 inspect games reamining for the current owner
		rConn.get(opts.inspectKey, (err, inspectUserUuid) => {
			if (err) {
				log.error(err, { key: opts.inspectKey });
				return cb(err);
			}
			// user is the owner of inspect and has 0 games left.
			if (inspectUserUuid === opts.userUuid) {
				return cb();
			}

			const gamesRemainingKey = userInspect(opts.tournamentUuid, inspectUserUuid);
			rConn.get(gamesRemainingKey, (err, gamesRemaining) => {
				if (err) {
					log.error(err, { key:gamesRemainingKey });
					return cb(err);
				}

				if (parseInt(gamesRemaining, 10) !== 0) {
					return cb();
				}

				// set overtop of the current key since that key has 0 games left
				rConn.set(opts.inspectKey, opts.userUuid, (err, success) => {
					if (err) {
						log.error(err, {
							key: opts.inspectKey,
							value: opts.userUuid
						});
						return cb(err);
					}
					return claimAndProcessInspect(db, rConn, opts, cb);
				});
			});
		});
	});
}

const claimAndProcessInspect = (db, rConn, opts, cb) => {
	rConn.set(opts.userInspectKey, opts.inspectLength, (err, success) => {
		if (err) {
			return cb(err);
		}

		decrementCoins(db, opts.tournamentUuid, opts.userUuid, opts.cost, (err, results) => {
			if (err) {
				// already logged
				return cb(err);
			}

			// get one extra since we're not actually inspecting the current matchup
			rConn.lrange(opts.userUpcomingKey, 1, opts.inspectLength, (err, userUpcomingCharacters) => {
				if (err) {
					log.error(err, { userUpcomingKey });
					return cb(err);
				}

				// get one extra since we're not actually inspecting the current matchup
				rConn.lrange(opts.opponentUpcomingKey, 1, opts.inspectLength, (err, opponentUpcomingCharacters) => {
					if (err) {
						log.error(err, { opponentUpcomingKey });
						return cb(err);
					}

					return cb(null, {
						available: false,
						remaining: opts.inspectLength,
						users: {
							ids: {
								[opts.userUuid]: userUpcomingCharacters.map(uc => JSON.parse(uc)),
								[opts.opponentUuid]: opponentUpcomingCharacters.map(uc => JSON.parse(uc))
							},
							result: [opts.userUuid, opts.opponentUuid]
						}
					});
				});
			});
		});
	});
};
