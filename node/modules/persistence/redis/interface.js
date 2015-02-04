var Pool = require('./pool');

// Private Helper
var startPool = function(config) {
	return new Pool(config.port, config.host)
};

var Interface = function(){
	this.ready = false;
	this.pools = {};

	
	this.pools = {
		persistent: {
			rw: startPool({
				host: 'localhost',
    			port: 6379
    		})
		}
	};
	this.ready = true;
};

Interface.prototype.get = function(redisType, connectionType) {
	if(!this.pools[redisType]) {
		var e = new Error('v-persistence:redis-get:invalid-type');
		throw e;
	}

	if(!this.pools[redisType][connectionType]) {
		var e = new Error('v-persistence:redis-get:invalid-type');
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
