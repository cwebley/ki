import express from 'express';
import bodyParser from 'body-parser';
import apiRouter from './routes';
import log from './logger';
import r from './reasons';
import redis from './persistence/redis';

var app = express();

console.log(`Logtastic running at level ${log.level}`);

app.use(log.middleware({
    level: log.Logtastic.INFO
}));
app.use(bodyParser.json());
app.use((err, req, res, next) => {
    log.error("express caught an error", {err: err});

    if (err.name === 'UnauthorizedError') {
        res.status(401).send(r.unauthorized);
    }
});

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
