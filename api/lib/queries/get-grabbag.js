import log from '../../logger';
import { userGrabbagKey } from '../util/redis-keys';

export default function getGrabbagQuery (rConn, opts, cb) {
	const grabbagKey = userGrabbagKey(opts.tournamentUuid, opts.userUuid);

	rConn.lrange(grabbagKey, 0, -1, (err, results) => {
		if (err) {
			log.error(err, {
				grabbagKey
			});
		}
		let parseError;
		const parsedGrabbag = results.map(i => {
			try {
				return JSON.parse(i);
			} catch (e) {
				parseError = e;
			}
		});
		if (parseError) {
			log.error('error parsing grabbag data', {
				grabbagKey,
				data: results
			});
			return cb(err);
		}

		return cb(null, parsedGrabbag);
	});
}
