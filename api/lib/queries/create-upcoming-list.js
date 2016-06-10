import log from '../../logger';
import config from '../../config';
import { upcomingList } from '../util/redis-keys';
import range from 'lodash.range';

// needs opts.uuid (tournamentUuid)
// opts.user.uuid, opts.user.characters (array),
// opts.opponent.uuid, opts.opponent.characters (array)
export default function createUpcomingListQuery (rConn, opts, cb) {

	// assemble the the user data
	const randomUserCharacters = range(0, config.defaults.upcomingListLength).map(() => {
		return opts.user.characters[Math.floor(Math.random() * opts.user.characters.length)];
	});
	const userKey = upcomingList(opts.uuid, opts.user.uuid);

	// push the user data
	rConn.rpush(userKey, ...randomUserCharacters, (err, results) => {
		if (err) {
			log.error(err, {
				key: userKey,
				value: randomUserCharacters
			});
		}
		log.debug('successfully added upcoming list redis for user', {
			key: userKey,
			value: randomUserCharacters,
			results: results
		});

		// assemble the opponent data
		const randomOpponentCharacters = range(0, config.defaults.upcomingListLength).map(() => {
			return opts.opponent.characters[Math.floor(Math.random() * opts.opponent.characters.length)];
		});
		const opponentKey = upcomingList(opts.uuid, opts.opponent.uuid);

		// push the opponent data
		rConn.rpush(opponentKey, ...randomOpponentCharacters, (err, results) => {
			if (err) {
				log.error(err, {
					key: opponentKey,
					value: randomOpponentCharacters
				});
			}
			log.debug('successfully added upcoming list redis for opponent', {
				key: opponentKey,
				value: randomOpponentCharacters
			});
			return cb(err, results);
		});
	});
}
