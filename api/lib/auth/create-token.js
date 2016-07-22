import jwt from 'jsonwebtoken';

import log from '../../logger';
import config from '../../config';

export default function createToken (user, cb) {
	jwt.sign(user, config.jwt.secret, {expiresIn: config.jwt.expiresIn}, (token) => {
		log.debug('jwt token created', {
			user,
			token
		});
		return cb(token);
	});
}
