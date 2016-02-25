import pg from 'pg';
import log from '../../logger';
import config from '../../config';

function query (sql, params, cb) {
	const conString = 'postgres://' + config.pg.username + ':' + config.pg.password + '@' + config.pg.server + '/' + config.pg.database;
	pg.connect(conString, (err, client, done) => {
		if (err) {
			console.error('failed pg connection', {err: err});
			return cb(err);
		}

		client.query(sql, params, (err, results) => {
			if (err) {
				log.error('sql query failed', {err: err, sql: sql, params: params});
			}
			done();
			cb(err, results);
		});
	});
}

export { query };
