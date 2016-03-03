import config from '../../config';
import redisConnect from './redis-connect';

let redis = new redisConnect({
	host: config.redis.host,
	db: config.redis.password
});

export default redis;
