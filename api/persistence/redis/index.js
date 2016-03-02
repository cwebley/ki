import redis from 'redis';
import config from '../../config';
import log from '../../logger';

var client = redis.createClient(config.redis.port, config.redis.host);

client.on('error', function(err) {
	log.error(err, {
		msg: 'redis client error, attempting to reconnect'
	});
	client = redis.createClient(config.redis.port, config.redis.host)
});

export default client;
