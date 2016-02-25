import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import slug from 'slug';
import uuid from 'node-uuid';

import config from '../config';
import log from '../logger';
import { query } from '../persistence/pg';

// returns a user object that can be used as a payload for a jwt
function registerUser (opts, cb) {
    log.notice('top of register user', opts);

    const userslug = slug(opts.username);
    const lowercaseEmail = opts.email.toLowerCase();

    bcrypt.hash(opts.password, 10, (err, hash) => {
        const userUuid = uuid.v4();
        const sql = 'INSERT INTO users (uuid, name, password, slug, email) VALUES ($1, $2, $3, $4, $5)';
        const params = [userUuid, opts.username, hash, userslug, lowercaseEmail];

        query(sql, params, (err, results) => {
            return cb(err, {
                uuid: userUuid,
                username: opts.username,
                slug: userslug
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

export { registerUser, createToken };
