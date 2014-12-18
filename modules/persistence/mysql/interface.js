var moment = require('moment'),
	vConfig = require('../../config'),
	log = require('../../log'),
	Pool = require('./pool');

// Private Helper
var startPool = function(config) {
	return new Pool(config.host, config.database || 'v', config.user, config.password)
};

var Interface = function(){
	this.pools = {
		all: {
			rw: startPool(vConfig.get('db:rw')),
			ro: startPool(vConfig.get('db:ro')),
			roi: startPool(vConfig.get('db:roi')),
		}
	};
};

Interface.prototype.query = function(db, type, sql, params, failmsg, cb) {
	if(!cb && typeof failmsg === 'function') {
		cb = failmsg;
		failmsg = params;
		params = sql;
		sql = type;
		type = db;
		db = 'all';
	}

	if(!this.pools[db]) {
		var e = new Error('persistence:mysql-get:invalid-db');
		log.trace(e, {db: db, type: type});
		throw e;
	}

	if(!this.pools[db][type]) {
		var e = new Error('persistence:mysql-get:invalid-type');
		log.trace(e, {db: db, type: type});
		throw e;
	}
	
	this.pools[db][type].query(sql, params, failmsg, cb);
};

Interface.prototype.now = function() {
	return moment().utc().format('YYYY-MM-DDTHH:mm:ss');
};

Interface.prototype.terminateAll = function() {
	this.pools.all.rw.terminate();
	this.pools.all.ro.terminate();
	this.pools.all.roi.terminate();
};

module.exports = Interface;
