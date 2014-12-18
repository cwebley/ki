var _ = require('lodash'),
	fs = require('fs'),
	path = require('path'),
	yaml = require('js-yaml'),
	log = require('../v-log'),
	Whoami = require('./whoami');


/** Config 
 * 
 * @param {Object} [options]
 * @param {String} [options.whoamiPath]
 * @param {String} [options.configPath]
 */
var Config = function(options){
	this.options = _.extend(Config.defaultOptions, options);
	this.values = {};
	this.cache = {};

	try {
		this.whoami = new Whoami(this.options.whoamiPath);
		this.loadFile(path.join(this.options.configFolder, 'main.yaml'));
		this.loadFile(path.join(this.options.configFolder, 'media-access.yaml'));
		this.loadFile(this.options.localConfig);
		this.setHosts();
		this.setEs();
		this.setGcloudJsonPath();
	} catch(err) {
		log.error('v-config:fatal-error', {err: err});
		process.exit(1);
	}
};


//Configs
//Helper function for default config path (its different for production builds vs running from src)
var getDefaultConfigPath = function(p) {
	if(p.split(path.sep)[5] === 'node') {
		return path.join(p.split(path.sep).slice(0, 5).join(path.sep), '/config');
	}
	return path.join(p.split(path.sep).slice(0, 6).join(path.sep), '/config');
}


Config.defaultOptions = {
	whoamiPath: '/etc/v/whoami.yaml',
	localConfig: '/etc/v/local.yaml',
	roleFolder: '/etc/v/roles',
	localGcloud: '/etc/v/gcloud-key.json',
	configFolder: getDefaultConfigPath(__dirname)
};


/**
 * @method setGcloudJsonPath
 * sets the path to the gcloud json file for authentication
 */
Config.prototype.setGcloudJsonPath = function() {
	if(fs.existsSync(Config.defaultOptions.localGcloud)) {
		this.set('storage:gcloud:keyFilename', Config.defaultOptions.localGcloud);
	} else {
		this.set('storage:gcloud:keyFilename', path.join(this.options.configFolder, 'gcloud-key.json'));
	}
}

//Methods
/** Clears the current config state
 * @method clear
 */
Config.prototype.clear = function() {
	this.values = {}
};

/** Loads a file
 * @method loadFile
 * @param {String} [directory]
 */
Config.prototype.loadFile = function(file) {
	if(fs.existsSync(file)){
		_.merge(this.values, yaml.safeLoad(fs.readFileSync(file, 'utf8')));
	}
};

/** The drill to container method is for returning the containing object.  This is for setting so it can be done by reference
 * @method drill
 * @param {String} [keyspace]
 * @param {Bool} [drillToContainer]
 */
Config.prototype.drill = function(keyspace, drillToContainer) {
	var path = keyspace.split(':'),
		o = this.values, 
		container = o;

	for(var i=0; i < path.length; i++) {
		if(o[path[i]] === undefined) {
			log.trace(new Error('v-config:no-config-value'), {
				key: keyspace
			});
			return null;
		}
		container = o;
		o = o[path[i]];
	}
	if(drillToContainer) return container;
	return o;
}

/** Sets a config variable.
 *
 * Drill to the containing object, then modify that, so that everything is done by reference.
 *
 * @method set
 * @param {Function} [set]
 * @param {String} [keyspace]
 * @param {Any} Object
 */
Config.prototype.set = function(keyspace, value) {
	if(!keyspace) {
		log.warn('v-config:invalid-set', {keyspace: keyspace, value: value});
		return;
	}

	var path = keyspace.split(':'),
		o = {};

	if(!path.length) {
		log.warn('v-config:invalid-set', {keyspace: keyspace, value: value});
		return;
	}

	if(craft(o, path.shift(), value, path)) {
		_.merge(this.values, o);
	}
	this.cache = {};
};
var craft = function(obj, key, value, p) {
	if(!key) return false;

	if(p.length <= 0) {
		obj[key] = value;
		return true;
	}

	obj[key] = {};
	return craft(obj[key], p.shift(), value, p);
}

/** Retrieves a config variable vube:app:abc:123
 * @method get
 * @param {String} [keyspace]
 */
Config.prototype.get = function(keyspace) {
	if(!keyspace) {
		vLog.trace(new Error('v-config:empty-get'), {keyspace: keyspace});
		return null;
	}

	if(!this.cache[keyspace])
		this.cache[keyspace] = this.drill(keyspace);

	return this.cache[keyspace];
};

/**
 * @method setEs
 */
Config.prototype.setEs = function() {
	this.set('search:indices:users:name', 'users');
	this.set('search:indices:users:types', {channel: 'channel'});

	this.set('search:indices:media:name', 'media');
	this.set('search:indices:media:types', {vod: 'vod'});
}

/** Set a bunch of hosts derived from configs
 * @method setHosts
 */
Config.prototype.setHosts = function() {
	var hosts = {},
		protocol = this.whoami.protocol || 'http://',
		klassStr = '',
		envStr = '',
		domain = this.whoami.domain,
		local = 'http://localhost';

	if(this.whoami.env === 'dev'){
		klassStr = this.whoami.class;
		envStr = '.' + this.whoami.env + '.';
		hosts.ls = 'http://' + this.whoami.class + '-ls.' + this.whoami.env + '.' + domain;
	} else if (this.whoami.env === 'staging') {
		klassStr = this.whoami.class + '.';
		hosts.ls = 'http://' + this.whoami.class + '-ls.' + domain;
	} else {
		hosts.ls = 'http://ls.' + domain;
	}

	hosts.http = protocol + klassStr + envStr + domain;
	hosts.video = protocol + 'cdn.video.' + klassStr + envStr + domain;
	hosts.thumb = protocol + 'cdn.thumb.' + klassStr + envStr + domain;
	hosts.userImage = protocol + 'cdn.userimage.' +  klassStr + envStr + domain;
	hosts.internalVideo = protocol + 'video.' + klassStr + envStr + domain;
	hosts.internalThumb = protocol + 'thumb.' + klassStr + envStr + domain;
	hosts.internalUserImage = protocol + 'userimage.' + klassStr + envStr + domain;
	hosts.authApi = local + '/api-auth/v1';
	hosts.localeApi = local + '/api-locale/v1';
	hosts.mediasvc = local + '/mediasvc';
	hosts.liveApi = local + '/api-live/v1';
	hosts.userApi = local + '/api-user/v1';
	hosts.cookieDomain = '.' + klassStr + envStr + domain;
	hosts.ejabberd = ((this.whoami.env === 'dev') ? klassStr + envStr : 'jabber.') + domain + '/http-bind';
	hosts.wsApi = protocol + 'ws.' + klassStr + envStr + domain;

	this.set('hosts', hosts);
}

module.exports = Config;
