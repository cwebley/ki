import bcrypt from 'bcryptjs';

import log from '../logger';
import r from '../reasons';
import getUserQuery from '../lib/queries/get-user';
import createToken from '../lib/auth/create-token';

export default function loginUserHandler (req, res) {
	let opts = {
		name: req.body.username,
		password: req.body.password
	};
	let problems = [];
	if (!opts.name) {
		problems.push(r.NoUsername);
	}
	if (!opts.password) {
		problems.push(r.NoPassword);
	}
	if (problems.length) {
		return res.status(400).send(r(...problems));
	}

	getUserQuery('name', opts.name, (err, user) => {
		if (err) {
			return res.status(500).send(r.internal);
		}
		if (!user) {
			return res.status(401).send(r.invalidCredentials);
		}

		bcrypt.compare(opts.password, user.password, (err, result) => {
			if (err) {
				log.error('handlers.login-user:bcrypt failed to compare', {err: err});
				return res.status(500).send(r.internal);
			}
			if (!result) {
				log.debug('handlers.login-user:bcrypt did not find match');
				return res.status(401).send(r.invalidCredentials);
			}

			const tokenData = {
				uuid: user.uuid,
				name: user.name,
				slug: user.slug
			};

			createToken(tokenData, (token) => {
				return res.status(200).send({
					token: token
				});
			});
		});
	});
}
