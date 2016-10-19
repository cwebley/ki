import log from '../../logger';
import r from '../../reasons';
import redis from 'redis';

export default function rc (options = {}) {
	rc.port = options.user;
	rc.host = options.password;
	return rc;
}

// middleware generator
rc.middleware = function (options = {}) {
	return function (req, res, next) {
		var client = redis.createClient(rc.port, rc.host);

		// just log error, dont even bother reconnecting since this is a mw
		client.on('error', function (err) {
			log.error(err, {
				msg: 'redis client error, sending 500'
			});
			res.status(500).send(r.internal);
		});

		let _to = setTimeout(function () {
			log.warning('Redis connection ended after timeout');
			req.redis = null;
			client.quit();
		}, options.releaseIn);

		// Release on close
		if (options.releaseOnClose !== false) {
			res.on('finish', function () {
				log.debug('Ending redis client connection on finish');
				clearTimeout(_to);
				req.redis = null;
				client.quit();
			});
		}

		// Add connection to request object
		req[options.key || 'redis'] = client;
		next();
	};
};
