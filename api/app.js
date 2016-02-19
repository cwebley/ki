import { query } from './persistence/pg';
import redis from './persistence/redis';
import chalk from 'chalk';
import util from 'util';
import Logtastic from 'logtastic/Logger';
import cliFormatter from 'Loggerr/formatters/cli';

var log = new Logtastic({
    level: Logtastic.DEBUG,
    formatter: cliFormatter
});
log.error(new Error('My error message'));
log.warning('WARNING happened', {
    foo: 'warning about what happened'
});

log.info('INFO happened', {
    foo: 'INFOF about what happened'
});
log.debug('DEBUG happened', {
    foo: 'DEBUG about what happened'
});

const sql = 'INSERT INTO users (name, password) VALUES ($1, $2)';
const params = ['Cameron', 'asdfasdf'];

// query(sql, params, (err, results) => {
//     console.log("PG ERR: ", err);
//     console.log("PG RESULTS: ", results);
// });

redis.set('foo', 'bar', (err, results) => {
    // console.log("REDIS ERR: ", err);
    // console.log("REDIS RESULTS: ", results);
    // log.info('REDIS RESULTS', {err: err, results: results});
});
