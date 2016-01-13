import { connect } from 'pg';
import { moment, format } from 'moment';
import { defaultConfig } from '../../config';

const TS_FORMAT = 'YYYY-MM-DD HH:mm:ss';

function now() {
	return moment().format(TS_FORMAT);
}

// higher order function for easy testing
// takes an optional config and returns a query function (sql, params, cb) => { return (err, results) } )
function pgSetup(config) {
	if ( !config ) {
		config = defaultConfigs.pg
	}

	return function(sql, params, cb) {
		const conString = 'postgres://' + config.username + ':' + config.password + '@' + config.server + '/' + config.database;
		pg.connect(conString, (err, client, done) => {
			if ( err ) {
				console.error('failed pg connection', {err: err});
				return cb(err);
			}

			client.query(sql, params, (err, results) => {
				if(err) {
					console.error('sql query failed', {err: err, sql: sql, params: params});
				}
				done();
				cb(err, results);
			});
		});
	}
}

export { TS_FORMAT, now, pgSetup };
