var _ = require('lodash'),
	fs = require('fs'),
	path = require('path'),
	yaml = require('js-yaml'),
	log = require('../v-log');

/** Loads whoami object synchronously.  Throws exceptions to "config" whenever there are failures, causing non-zero process.exit
 *
 * @class Whoami
 * @param {String} [filepath] the whoami file
 * @param {String} [roleFolder] has all the roles
 */
var Whoami = function(filepath) {
	// Add everything from the whoami to this object
	_.extend(this, yaml.safeLoad(fs.readFileSync(filepath, 'utf8')));
};

/**
 * @method override
 * @param {String} [filepath]
 */
Whoami.prototype.override = function(filepath) {
	_.merge(this, yaml.safeLoad(fs.readFileSync(filepath, 'utf8')));
}

module.exports = Whoami;
