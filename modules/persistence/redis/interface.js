var vConfig = require('../../config'),
	log = require('../../log'),
	Pool = require('./pool');

// Private Helper
var startPool = function(config) {
	return new Pool(config.port, config.host)
};

var Interface = function(){
	this.ready = false;
	this.pools = {};

	
	this.pools = {
		cache: {
			rw: startPool(vConfig.get('redis:cache')),
			ro: startPool(vConfig.get('redis:cache'))
		},
		localCache: {
			rw: startPool(vConfig.get('redis:localcache')),
			ro: startPool(vConfig.get('redis:localcache'))
		},
		persistent: {
			rw: startPool(vConfig.get('redis:rw')),
			ro: startPool(vConfig.get('redis:ro')),
			roi: startPool(vConfig.get('redis:roi'))
		}
	};
	this.ready = true;
};

Interface.prototype.get = function(redisType, connectionType) {
	if(!this.pools[redisType]) {
		var e = new Error('persistence:redis-get:invalid-type');
		log.trace(e, {redisType: redisType, connectionType: connectionType});
		throw e;
	}

	if(!this.pools[redisType][connectionType]) {
		var e = new Error('persistence:redis-get:invalid-type');
		log.trace(e, {redisType: redisType, connectionType: connectionType});
		throw e;
	}

	return this.pools[redisType][connectionType].get();
};

Interface.prototype.terminateAll = function() {
	this.pools.cache.rw.terminate();
	this.pools.cache.ro.terminate();
	this.pools.localCache.rw.terminate();
	this.pools.localCache.ro.terminate();
	this.pools.persistent.rw.terminate();
	this.pools.persistent.ro.terminate();
	this.pools.persistent.roi.terminate();
};

module.exports = Interface;
