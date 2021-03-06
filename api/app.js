import express from 'express';
import bodyParser from 'body-parser';
import apiRouter from './routes';
import log from './logger';
import r from './reasons';
import cors from 'cors';
import path from 'path';

// gzip
import compression from 'compression';

let app = express();

console.log(`Logtastic running at level ${log.level}`);

app.use(express.static(path.resolve(__dirname, '../dist')));

app.use(log.middleware({
	level: log.Logtastic.INFO
}));

app.use(bodyParser.json());
app.use(cors());
app.use('/api', apiRouter);

// error handling mw
app.use((err, req, res, next) => {
	log.info('express caught an error', {err: err});

	if (err.name === 'UnauthorizedError') {
		res.status(401).send(r(r.Unauthorized));
	}
});

// wildcard route for the react router front end
app.get('*', compression(), (req, res) => {
	res.sendFile(path.resolve(__dirname, '../dist/index.html'));
});

export default app;
