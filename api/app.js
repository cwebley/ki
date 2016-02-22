import redis from './persistence/redis';
import log from './logger';
import express from 'express';

var app = express();

app.use(log.middleware({
    // this might change in the Logtastic beta
    level: log.Logtastic.DEBUG
}));

app.get('/', (req, res) => {
    res.status(200).send({hello: 'world'});
});

// const sql = 'INSERT INTO users (name, password) VALUES ($1, $2)';
// const params = ['Cameron', 'asdfasdf'];

// query(sql, params, (err, results) => {
//     console.log("PG ERR: ", err);
//     console.log("PG RESULTS: ", results);
// });

// redis.set('foo', 'bar', (err, results) => {
    // console.log("REDIS ERR: ", err);
    // console.log("REDIS RESULTS: ", results);
    // log.info('REDIS RESULTS', {err: err, results: results});
// });

export default app;
