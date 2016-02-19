import redis from 'redis';
import { config } from '../../config';

var client = redis.createClient(config.redis.port, config.redis.host);

client.on('error', function(err) {
	client = redis.createClient(config.redis.port, config.redis.host)
});

export default client;
