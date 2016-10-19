import config from '../../config';
import RedisConnect from './redis-connect';

let redis = new RedisConnect({
	host: config.redis.host,
	db: config.redis.password
});

export default redis;
