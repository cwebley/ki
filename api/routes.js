import express from 'express';
import jwt from 'express-jwt';
import r from './reasons';
import config from './config';
import { registerUser, checkPassword, createToken } from './auth/register-user';

var router = express.Router();

router.get('/', (req, res) => {
	res.status(200).send({hello: 'world'});
});

router.post('/register', (req, res) => {
	let opts = {
		username: req.body.username,
		password: req.body.password,
		confirmPassword: req.body.confirmPassword,
		email: req.body.email
	};

	let problems = [];
	if (!opts.username) {
		problems.push(r.NoUsername);
	}
	if (!opts.password) {
		problems.push(r.NoPassword);
	}
	if (!opts.confirmPassword) {
		problems.push(r.NoConfirmPassword);
	}
	if (!opts.email) {
		problems.push(r.NoEmail);
	}
	if (problems.length) {
		return res.status(400).send(r(...problems));
	}

	if (opts.username.length > 15 || !isAlphaNumeric(opts.username)) {
		problems.push(r.InvalidUsername);
	}
	if (opts.password.length < 6 || opts.password.length > 255) {
		problems.push(r.PasswordComplexity);
	}
	if (opts.password !== opts.confirmPassword) {
		problems.push(r.PasswordMismatch);
	}
	let splitEmail = opts.email.split('@');
	if (splitEmail.length !== 2 || splitEmail[1].indexOf('.') === -1) {
		problems.push(r.InvalidEmail);
	}
	if (problems.length) {
		return res.status(400).send(r(...problems));
	}

	registerUser(opts, (err, user) => {
		if (err) {
			if (err.message.slice(0, 9) === 'duplicate') {
				return res.status(400).send(r.duplicateUsername);
			}
			return res.status(400).send(r.internal);
		}

		createToken(user, (token) => {
			return res.status(201).send({
				token: token
			});
		});
	});
});

router.post('/login', (req, res) => {
	let opts = {
		username: req.body.username,
		password: req.body.password
	};
	let problems = [];
	if (!opts.username) {
		problems.push(r.NoUsername);
	}
	if (!opts.password) {
		problems.push(r.NoPassword);
	}
	if (problems.length) {
		return res.status(400).send(r(...problems));
	}

	checkPassword(opts, (err, user) => {
		if (err) {
			return res.status(500).send(r.internal);
		}
		if (!user) {
			return res.status(401).send(r.invalidCredentials);
		}
		createToken(user, (token) => {
			return res.status(200).send({
				token: token
			});
		});
	});
});

router.get('/protected', jwt({secret: config.jwt.secret}), (req, res) => {
	res.status(200).send({user: req.user});
});

function isAlphaNumeric (str) {
	for (let i = 0; i < str.length; i++) {
		let code = str.charCodeAt(i);
		if (!(code > 47 && code < 58) && //numeric 0-9
			!(code > 64 && code < 91) && // upper alpha A-Z
			!(code > 96 && code < 123)) { // lower alpha a-z
			return false;
		}
		return true;
	}
}


export default router;
