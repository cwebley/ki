import uuid from 'node-uuid';
import slug from 'slug';
import bcrypt from 'bcryptjs';

import log from '../logger';
import r from '../reasons';
import registerUserQuery from '../lib/queries/register-user';
import createToken from '../lib/auth/create-token';

export default function registerUserHandler (req, res) {
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

	if (opts.username.length > 25) {
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

	const userUuid = uuid.v4();
	const userSlug = slug(opts.username);

	bcrypt.hash(opts.password, 10, (err, hash) => {
		if (err) {
			return res.status(500).send(r.internal);
		}

		registerUserQuery(userUuid, opts.username, userSlug, opts.email, hash, (err, user) => {
			if (err) {
				if (err.message.slice(0, 9) === 'duplicate') {
					// could also be a duplicate slug, but whatever
					return res.status(409).send(r.duplicateUsername);
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
}
