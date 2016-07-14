import log from '../../logger';
import { upcomingList, inspect, userInspect } from '../util/redis-keys';

export default function getInspect (rConn, opts, cb) {
	const inspectKey = inspect(opts.tournamentUuid);
	const userUpcomingKey = upcomingList(opts.tournamentUuid, opts.userUuid);
	const opponentUpcomingKey = upcomingList(opts.tournamentUuid, opts.opponentUuid);

	rConn.get(inspectKey, (err, inspectUuid) => {
		if (err) {
			return cb(err);
		}

		if (!inspectUuid) {
			return cb(null, {
				available: true
			});
		}

		const userInspectKey = userInspect(opts.tournamentUuid, inspectUuid);

		rConn.get(userInspectKey, (err, gamesRemaining) => {
			if (err) {
				return cb(err);
			}

			// opponent is using inspect, but there are 0 games left so it is available for the user.
				if (inspectUuid !== opts.userUuid) {
					if (parseInt(gamesRemaining, 10) === 0) {
						return cb(null, {
							available: true,
							remaining: 0
						});
					}
					return cb(null, {
						available: false,
						remaining: parseInt(gamesRemaining, 10)
					});
				}
				if (inspectUuid === opts.userUuid && parseInt(gamesRemaining, 10) === 0) {
					return cb(null, {
						available: false,
						remaining: 0
					});
				}

			// user is inspecting with games remaining
			rConn.lrange(userUpcomingKey, 1, parseInt(gamesRemaining, 10), (err, userUpcoming) => {
				if (err) {
					log.error(err, {
						key: userUpcomingKey
					});
				}

				rConn.lrange(userUpcomingKey, 1, parseInt(gamesRemaining, 10), (err, opponentUpcoming) => {
					if (err) {
						log.error(err, {
							opponentUpcomingKey
						});
					}

					return cb(null, {
						available: false,
						remaining: parseInt(gamesRemaining, 10),
						users: {
							ids: {
								[opts.userUuid]: userUpcoming.map(r => JSON.parse(r)),
								[opts.opponentUuid]: opponentUpcoming.map(r => JSON.parse(r))
							},
							result: [opts.userUuid, opts.opponentUuid]
						}
					});
				});
			});
		});
	});
}
