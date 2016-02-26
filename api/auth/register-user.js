import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import slug from 'slug';
import uuid from 'node-uuid';

import config from '../config';
import log from '../logger';
import { query } from '../persistence/pg';

// returns a user object that can be used as a payload for a jwt
function registerUser (opts, cb) {
	const userslug = slug(opts.username);
	const lowercaseEmail = opts.email.toLowerCase();

	bcrypt.hash(opts.password, 10, (err, hash) => {
		const userUuid = uuid.v4();
		const sql = 'INSERT INTO users (uuid, name, password, slug, email) VALUES ($1, $2, $3, $4, $5)';
		const params = [userUuid, opts.username, hash, userslug, lowercaseEmail];

		query(sql, params, (err, results) => {
			return cb(err, {
				uuid: userUuid,
				name: opts.username,
				slug: userslug
			});
		});
	});
}

// returns a user object that can be used as a payload for a jwt
function checkPassword (opts, cb) {
	const sql = 'SELECT uuid, slug, password FROM users WHERE name = $1';
	const params = [opts.username];

	query(sql, params, (err, results) => {
		if (err) {
			return cb(err);
		}
		if (!results.rows.length) {
			log.debug('auth.checkPassword:User not found', {username: opts.username});
			return cb(null, false);
		}

		bcrypt.compare(opts.password, results.rows[0].password, (err, res) => {
			if (err) {
				log.error('auth.checkPassword:bcrypt failed to compare', {err: err});
				return cb(err);
			}
			if (!res) {
				log.debug('auth.checkPassword:bcrypt did not find match');
				return cb(null, false);
			}
			return cb(null, {
				uuid: results.rows[0].uuid,
				name: opts.username,
				slug: results.rows[0].slug
			});
		});
	});
}

function createToken (user, cb) {
	jwt.sign(user, config.jwt.secret, {expiresIn: config.jwt.expiresIn}, (token) => {
		log.notice('token created', {token: token});
		return cb(token);
	});
}

export { registerUser, checkPassword, createToken };
