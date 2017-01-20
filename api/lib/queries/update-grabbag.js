import log from '../../logger';
import { userGrabbagKey } from '../util/redis-keys';
import decrementCoins from './decrement-coins';
import shuffleArray from '../util/shuffle-array';
import getGrabbagQuery from './get-grabbag';
import updateUpcomingQuery from './update-upcoming';

export default function updateGrabbagQuery (db, rConn, opts, cb) {
	const grabbagKey = userGrabbagKey(opts.tournamentUuid, opts.userUuid);

	rConn.lindex(grabbagKey, opts.grabbagIndex, (err, grabbagCharacterData) => {
		if (err) {
			log.error(err, {
				grabbagIndex: opts.grabbagIndex
			});
			return cb(err);
		}

		let grabbagCharacterArray;
		try {
			grabbagCharacterArray = JSON.parse(grabbagCharacterData);
		} catch (e) {
			log.error(e);
			return cb(e);
		}

		if (grabbagCharacterArray.indexOf(opts.grabbagCharacterUuid) === -1) {
			// character submitted is not an option
			log.error('grabbagCharacterUuid not found at this index', {
				grabbagIndex: opts.grabbagIndex,
				grabbagCharacterUuid: opts.grabbagCharacterUuid
			});
			return cb();
		}

		rConn.lrem(grabbagKey, 1, grabbagCharacterData, (err, numberRemoved) => {
			if (err) {
				log.error(err, {
					grabbagKey,
					grabbagCharacterData
				});
				return cb(err);
			}
			if (numberRemoved !== 1) {
				log.info('one item not removed from grabbag list', {
					grabbagIndex: opts.grabbagIndex,
					grabbagCharacterUuid: opts.grabbagCharacterUuid
				});
			}

			getGrabbagQuery(rConn, {
				tournamentUuid: opts.tournamentUuid,
				userUuid: opts.userUuid
			}, (err, parsedGrabbag) => {
				if (err) {
					return cb(err);
				}

				updateUpcomingQuery(rConn, {
					tournamentUuid: opts.tournamentUuid,
					characterUuid: opts.grabbagCharacterUuid,
					userUuid: opts.userUuid
				}, (err, upcomingMatch) => {
					if (err) {
						return cb(err);
					}
					return cb(null, {
						grabbag: parsedGrabbag,
						upcomingMatch: upcomingMatch
					});
				});
			});
		});
	});
}
