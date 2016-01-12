import { defaultConfigs } from './config';
import { TS_FORMAT, now, query } require('../../node-packages/pg');

function query(sql, params, cb) {
	query(defaultConfigs.pg, sql, params, cb);
}


export { TS_FORMAT, now, query };
