import { defaultConfigs } from './config';
import { TS_FORMAT, now, pgSetup } require('./pg');

function query(sql, params, cb) {
	return pgSetup(defaultConfigs.pg);
}

export { TS_FORMAT, now, query };
