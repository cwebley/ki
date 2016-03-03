import log from '../../logger';
import { upcomingList } from '../util/redis-keys';

// always returns an array of characterUuids. optionally takes an amount arg
export default function getUpcoming (rConn, opts, cb) {
	if (!opts.amount) {
		opts.amount = 1;
	}
	const key = upcomingList(opts.tournamentUuid, opts.userUuid);

	rConn.lrange(key, 0, opts.amount - 1, (err, results) => {
		if (err) {
			log.error(err, {
				key: key
			});
		}
		return cb(err, results);
	});
}
