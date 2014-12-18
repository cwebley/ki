# v-persistence

Common Redis and MySQL components

## Mysql

		var mysql = require('../v-persistence').mysql;

		mysql.query('media', 'rw', 'insert into blah (id) values (?);', [1], 'signature-to-be-show-on-failures', function(err, results){
			
		});

### Available Connections

media: rw
media: ro
media: roi
users: rw
users: ro
users: roi
ads: rw
ads: ro
ads: roi

## Redis

		var redis = require('../persistence').redis;

		var conn = redis.get('cache', 'rw');
		conn.get('foo', function(err, value){
			
		});

### Available Connections

cache: rw
cache: ro
localCache: rw
localCache: ro
persistent: rw
persistent: ro
persistent: roi