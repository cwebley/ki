import { query } from './persistence/pg';
import redis from './persistence/redis';
import Loggerr from 'loggerr';
import cliFormatter from 'loggerr/formatters/cli';

var log = new Loggerr({
    level: Loggerr.INFO,
    formatter: cliFormatter
});
log.error(new Error('My error message'));

log.debug('Something happened', {
    foo: 'info about what happened'
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
