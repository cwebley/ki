import { connect } from 'pg';
import { config } from '../../config';

function query (config, sql, params, cb) {
	const conString = 'postgres://' + config.username + ':' + config.password + '@' + config.server + '/' + config.database;
	pg.connect(conString, (err, client, done) => {
		if (err) {
			console.error('failed pg connection', {err: err});
			return cb(err);
		}

		client.query(sql, params, (err, results) => {
			if (err) {
				console.error('sql query failed', {err: err, sql: sql, params: params});
			}
			done();
			cb(err, results);
		});
	});
}

export { query };
