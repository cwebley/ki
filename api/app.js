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

app.use('/api', apiRouter);

// error handling mw
app.use((err, req, res, next) => {
    log.info("express caught an error", {err: err});

    if (err.name === 'UnauthorizedError') {
        res.status(401).send(r(r.Unauthorized, err.message));
    }
});

export default app;
