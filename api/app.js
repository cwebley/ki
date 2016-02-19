import { query } from './persistence/pg';
import redis from './persistence/redis';
var Loggerr = require('loggerr');

var log = new Loggerr({
    level: Loggerr.INFO
});
// log.error(new Error('My error message'));

log.info('Something happened', {
    foo: 'info about what happened'
});

// import chalk from 'chalk';
//
// var Logtastic = require('logtastic/Logger');
//
// console.log("CRED: ", chalk.red)
// function formatter (date, level, data) {
//     var color;
//     switch (level) {
//         case Logtastic.EMERGENCY:
//         case Logtastic.ALERT:
//         case Logtastic.CRITICAL:
//         case Logtastic.ERROR:
//             color = chalk.red;
//             break;
//         case Logtastic.WARNING:
//         case Logtastic.NOTICE:
//             color = chalk.yellow;
//             break;
//         case Logtastic.INFO:
//         case Logtastic.DEBUG:
//             color = chalk.white;
//             break;
//     }
//     console.log("COLOR: ", color)
//     return color(data.msg);
// };
//
// var log = new Logtastic({
//     formatter: formatter
// });
//
// log.outfile = 'stdout.log';
// log.level= log.INFO;
//
// log.error(new Error('My error message'));

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
