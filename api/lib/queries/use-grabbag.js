import log from '../../logger';
import { userGrabbagKey } from '../util/redis-keys';
import decrementCoins from './decrement-coins';
import shuffleArray from '../util/shuffle-array';
import getGrabbagQuery from './get-grabbag';

export default function useGrabbagQuery (db, rConn, opts, cb) {
	const grabbagKey = userGrabbagKey(opts.tournamentUuid, opts.userUuid);

	const shuffledArray = shuffleArray(opts.characterUuids.slice());
	const grabbagCharacters = shuffledArray.slice(0, opts.grabbagChoiceCount);

	rConn.rpush(grabbagKey, JSON.stringify(grabbagCharacters), (err, success) => {
		if (err) {
			log.error(err, { grabbagCharacters });
			return cb(err);
		}

		decrementCoins(db, opts.tournamentUuid, opts.userUuid, opts.cost, (err, results) => {
			if (err) {
				// already logged
				return cb(err);
			}

			getGrabbagQuery(rConn, {
				tournamentUuid: opts.tournamentUuid,
				userUuid: opts.userUuid
			}, cb);
		});
	});
}
