var mysql = require('mysql'),
	log = require('../../log'),
	config = require('../config');

/** Starts a connection, cleans them on an interval, exposes a getter to retrieve them.
 * @method Mysql Pool
 * @param {String} [host]
 * @param {String} [db]
 * @param {String} [user]
 * @param {String} [password]
 */
var Pool = function(host, db, user, password){
	this.host = host;
	this.db = db;
	this.user = user;
	this.password = password;

	if(!this.host) {
		log.trace(new Error('persistence:mysql-pool:unknown-host'));
	}
	if(!this.db) {
		log.trace(new Error('persistence:mysql-pool:unknown-db'));
	}
	if(!this.user) {
		log.trace(new Error('persistence:mysql-pool:unknown-user'));
	}
	if(!this.password) {
		log.trace(new Error('persistence:mysql-pool:unknown-password'));
	}

	this.clients = [];
	this.start();

	// this.cleanInterval = setInterval(this.clean.bind(this), config.mysql.cleanInterval);
};

Pool.prototype.start = function() {
	var pool = mysql.createPool({
		host: this.host,
		user: this.user,
		password: this.password,
		database: this.db,
		timezone: 'GMT'
	});

	this.clients.unshift(pool);
};

Pool.prototype.get = function(){
	if(!this.clients.length) {
		this.start();
		return this.get();
	}

	return this.clients[0];
};

Pool.prototype.query = function(sql, params, failmsg, cb) {
	this.get().getConnection(function(err, conn){
		if(err) {
			if(conn && conn.release) conn.release();
			return cb(err);
		}
		conn.query(sql, params, function(err, results){
			if(err) log.error('persistence:mysql:query-failed', {queryName: failmsg, err: err, sql: sql, params: params});
			cb(err, results);
		});
		conn.release();
	});
};

Pool.prototype.endConnections = function(startIndex) {
	if(startIndex === undefined) startIndex = 1;
	for(var i=startIndex, l=this.clients.length; i<l; i++) {
		this.clients[i].end();
	}

	setTimeout(function(){
		this.clients.splice(1);
	}.bind(this), Math.min(1000, config.mysql.cleanInterval))
}

Pool.prototype.clean = function(startIndex) {
	this.start();
	this.endConnections(startIndex);
}

Pool.prototype.terminate = function() {
	clearInterval(this.cleanInterval);
	this.endConnections(0);
};

module.exports = Pool;
