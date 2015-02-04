var redis = require('redis'),
	config = require('../config');

/** Starts a connection, cleans them on an interval, exposes a getter to retrieve them.
 * @method Redis Pool
 * @param {Number} [port]
 * @param {String} [host]
 */
var Pool = function(port, host){
	this.port = port;
	this.host = host;

	this.clients = [];
	this.start();

	this.cleanInterval = setInterval(this.clean.bind(this), config.redis.cleanInterval);
};

Pool.prototype.start = function() {
	this.clients.unshift(redis.createClient(this.port, this.host, {
		no_ready_check: true
	}));
};

Pool.prototype.get = function(){
	if(!this.clients.length) {
		this.start();
		return this.get();
	}

	return this.clients[0];
};

Pool.prototype.endConnections = function(startIndex) {
	if(startIndex === undefined) startIndex = 1;
	for(var i=startIndex, l=this.clients.length; i<l; i++) {
		this.clients[i].quit();
	}

	setTimeout(function(){
		this.clients.splice(1);
	}.bind(this), Math.min(1000, config.redis.cleanInterval))
}

Pool.prototype.clean = function(startIndex) {
	this.start();
	this.endConnections(startIndex);
}

Pool.prototype.terminate = function() {
	clearInterval(this.cleanInterval);
	this.endConnections(0);
}

module.exports = Pool;
