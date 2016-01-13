import { defaultConfigs } from './config';
import { TS_FORMAT, now, pgSetup } require('./pg');

function query(sql, params, cb) {
	pgSetup(defaultConfigs.pg, sql, params, cb);
}

export { TS_FORMAT, now, query };
