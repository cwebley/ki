import config from '../../config';
import PgConnect from './pg-connect';

let db = new PgConnect({
	user: config.pg.username,
	password: config.pg.password,
	host: config.pg.server,
	db: config.pg.database
});

export default db;
