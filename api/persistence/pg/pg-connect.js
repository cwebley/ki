import pg from 'pg';
import once from 'once';
import log from '../../logger';

 export default function pgc (options = {}) {
	pgc.user = options.user;
	pgc.password = options.password;
	pgc.host = options.host;
	pgc.db = options.db;
	pgc.connectionString = `postgres://${pgc.user}:${pgc.password}@${pgc.host}/${pgc.db}`;
	return pgc;
};

// Get a connection, log err on failure
pgc.connect = function (done) {
	pg.connect(pgc.connectionString, function(err, client, release) {
		if (err) {
			log.error(err, {
				connString: pgc.connectionString
			});
			return done(err);
		}
		done(null, client, release);
	});
};

// A middleware generator with options
pgc.middleware = function (options = {}) {
	return function(req, res, next) {
		pgc.connect(function(err, conn, release) {
			if (err) {
				// The error is logged inside db
				return res.status(500).send(r.internal);
			}

			// Only call release once
			release = once(release);

			// Start timeout if one was set
			var _to;
			if (options.releaseIn) {
				_to = setTimeout(function() {
					log.warning('DB connection released after timeout');
					req.db = null;
					release();
				}, options.releaseIn);
			}

			// Release on close
			if (options.releaseOnClose !== false) {
				res.on('finish', function() {
					log.debug('Releasing db connection on finish');
					clearTimeout(_to);
					req.db = null;
					release();
				});
			}

			// Add connection to request object
			req[options.key || 'db'] = conn;
			next();
		});
	};
};
