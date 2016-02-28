import express from 'express';
import jwt from 'express-jwt';
import db from './persistence/pg';
import config from './config';

// handlers
import createCharacter from './handlers/create-character';
import registerUser from './handlers/register-user';
import loginUser from './handlers/login-user';
import createTournament from './handlers/create-tournament';

let router = express.Router();

// sets req.db
router.use(db.middleware({
	releaseIn: 30*1000 // 30 seconds
}));

// validates token and sets req.user with token data
let requiresLogin = jwt({secret: config.jwt.secret});

router.post('/user/register', registerUser);
router.post('/user/login', loginUser);

router.post('/character', createCharacter);

router.post('/tournament', requiresLogin, createTournament);


function rollback (req, res) {
	console.log("ROLL BACK CALLED")
	req.db.query('ROLLBACK', () => {
		console.log("ENDING BC OF ROLLBACK");
		req.db.end();
		res.status(500).send({success: false, rollback: 'true'})
	});
}

import uuid from 'node-uuid';

router.get('/tx-test', (req, res) => {
	let name = 22345;
	const pass = 'asdfasdf';
	const sql = 'insert into users (uuid, name, slug, password) values($1, $2, $3, $4)';

	req.db.query('BEGIN', (err, results) => {
		console.log("TX BEGUN");

		req.db.query(sql, [uuid.v4(), name, name, pass], (err, results) => {
			console.log("Q1: ", err, results);
			if (err) {
				return rollback(req, res);
			}

			name++
			req.db.query(sql, [uuid.v4(), name, name, pass], (err, results) => {
				console.log("Q2: ", err, results);
				if (err) {
					return rollback(req, res);
				}

				name++
				req.db.query(sql, [uuid.v4(), name, 22345, pass], (err, results) => {
					console.log("Q3: ", err, results)
					if (err) {
						return rollback(req, res);
					}

					console.log("COMMITTING");
					req.db.query('COMMIT', req.db.end.bind(req.db))
					return res.status(200).send({done: true});
				});
			});
		});
	});
});

export default router;
