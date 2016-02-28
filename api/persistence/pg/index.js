import config from '../../config';
import pgConnect from './pg-connect';

let db = pgConnect({
	user: config.pg.username,
	password: config.pg.password,
	host: config.pg.server,
	db: config.pg.database
});

export default db;
