import log from '../../logger';
import config from '../../config';
import { upcomingList } from '../util/redis-keys';
import decrementCoins from './decrement-coins';

export default function oddsmakerQuery (db, rConn, opts, cb) {
	const upcomingKey = upcomingList(opts.tournamentUuid, opts.userUuid);

	// get one extra since we're not actually oddsmakering the current matchup
	rConn.lrange(upcomingKey, 0, opts.oddsmakerLength + 1, (err, upcomingCharacters) => {
		if (err) {
			log.error(err, { upcomingKey })
			return cb(err);
		}
		const updatedCharacters = upcomingCharacters.map((cUuid, i) => {
			if (i === 0) {
				// don't odds the first character
				return cUuid
			}
			return Math.floor(Math.random() * opts.oddsmakerLength / opts.oddsmakerValue) === 0 ? opts.characterUuid : cUuid
		});

		rConn.ltrim(upcomingKey, 0, opts.oddsmakerLength + 1, (err, trimResult) => {
			if (err) {
				return log.error(err, { upcomingKey });
				return cb(err);
			}

			rConn.lpush(upcomingKey, ...updatedCharacters.reverse(), (err, pushResults) => {
				if (err) {
					return log.error(err, { upcomingKey, updatedCharacters });
					return cb(err);
				}

				decrementCoins(db, opts.tournamentUuid, opts.userUuid, opts.cost, (err, results) => {
					if (err) {
						// already logged
						return cb(err);
					}
					return cb(null, upcomingCharacters);
				});
			});
		});
	});
}
