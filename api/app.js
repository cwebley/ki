import redis from './persistence/redis';
import log from './logger';
import express from 'express';
import apiRouter from './routes';
import bodyParser from 'body-parser';

var app = express();

app.use(log.middleware({
    level: log.Logtastic.INFO
}));
app.use(bodyParser.json());

app.use('/api', apiRouter);

// app.get('/', (req, res) => {
//     res.status(200).send({hello: 'world'});
// });

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
