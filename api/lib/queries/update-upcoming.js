import log from '../../logger';
import { upcomingList } from '../util/redis-keys';

export default function updateUpcoming (rConn, opts, cb) {
	const upcomingKey = upcomingList(opts.tournamentUuid, opts.userUuid);

	// pop off the current match
	rConn.lpop(upcomingKey, (err, currentMatchData) => {
		console.log("CMD: ", currentMatchData)
		if (err) {
			log.error(err, { upcomingKey });
			cb(err);
		}

		let currentMatchParsed;
		try {
			currentMatchParsed = JSON.parse(currentMatchData);
		} catch (e) {
			log.error('error parsing current upcoming match', {
				upcomingKey
			});
			return cb(err);
		}

		let replacementUpcoming = {
			uuid: currentMatchParsed.uuid,
			characterUuid: opts.characterUuid,
			grabbag: true
		};

		rConn.lpush(upcomingKey, JSON.stringify(replacementUpcoming), (err, success) => {
			if (err) {
				log.error(err, { upcomingKey });
				return cb(err);
			}

			return cb(null, replacementUpcoming);
		});
	});
}
