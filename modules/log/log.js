var _ = require('lodash'),
	moment = require('moment'),
	ansi = require('ansi');

var defaultOptions = {
	accessLog: false,
	stderrStreams: [process.stderr],
	stdoutStreams: [process.stdout],
	dStreams: [process.stderr],
	dColor: [67, 121, 232], //'#4379E8', //blue
	d: false,
	defaultLevel: 'info',
	levels: ['debug', 'verbose', 'info', 'warn', 'error', 'fatal'],
	stderrBreak: 'debug',
	level: 'info',
	color: true,
	colors: {
		verbose: [170, 170, 170], //'#aaa', //grey
		verbose: [221, 221, 221], //'#eeeeee', //grey
		info: [255, 255, 255], //'#ffffff', //white
		warn: [232, 226, 163], //'#E8E2A3', //yellow
		error: [232, 132, 77], //'#E8844D', //orange
		fatal: [196, 64, 48] //'#C44030', //red
	}
};

/**
 * @class Log
 * @param {Object} [options]
 * @param {Object} [options.stderrStreams]
 * @param {Object} [options.stdoutStreams]
 */
var Log = module.exports = function(options){
	this.options = _.extend({}, defaultOptions, options);
	this.setStreams(this.options.stdoutStreams, this.options.stderrStreams, this.options.dStreams);
	this.setLevels();
	this.paused = false;
};

/** Sets stdout and stderr streams
 * @method setStreams
 * @param {Object} [stdout] stdout stream
 * @param {Object} [stderr] stderr stream
 */
Log.prototype.setStreams = function(stdout, stderr, d) {
	this.stderrCursors = _.map(stderr, function(s){ return ansi(s); });
	this.stdoutCursors = _.map(stdout, function(s){ return ansi(s); });
	this.dCursors = _.map(d, function(s){ return ansi(s); });
}

/**
 * @method setLevel
 * @param {String} [l]
 */
Log.prototype.setLevel = function(l) {
	this.options.level = l;
	this.setLevels();
}

/**
 * @method setOption
 * @param {String} [key]
 * @param {Any} [value]
 */
Log.prototype.setOption = function(k, v) {
	this.options[k] = v;
}

/**
 * @method getOption
 * @param {String} [key]
 * @param {Any} [value]
 */
Log.prototype.getOption = function(k) {
	return this.options[k];
}

/**
 * @method setLevels
 * @param 
 */
Log.prototype.setLevels = function() {
	var writing = false,
		stderring = false,
		stderrMap = {},
		stdoutMap = {},
		streams, l;

	for(var i=0; i<this.options.levels.length; i++) {
		l = this.options.levels[i];

		if(!stderring && l === this.options.stderrBreak) stderring = true;
		if(!writing && l === this.options.level) writing = true;

		this[l] = this.generateWrite(l);
		if(!writing) continue;

		if(stderring)
			stderrMap[l] = true;
		else
			stdoutMap[l] = true;
	}

	this.d = this.generateWrite('d');
	this.stderrMap = stderrMap;
	this.stdoutMap = stdoutMap;
}

/**
 * @method generateWrite
 * @param {Function} [level]
 */
Log.prototype.generateWrite = function(level) {
	return function() {
		var a = _.map(arguments, function(x){ return x; });
		a.unshift(level);
		this.write.apply(this, a);
	}.bind(this);
}

/**
 * @method parseMsg
 * @param {Any} [addition]
 */
Log.prototype.parseMsg = function(addition, n) {
	var s = this,
		n = n || 0;

	if(Array.isArray(addition)){
		if(n === 0)
			return 'msg='+addition.join(',');
		return addition.join(',');
	}

	if(typeof addition === 'object')
		return _.map(addition, function(v, k){ 
			var m = s.parseMsg(v, n+1);
			if(n > 0)
				return k+':['+m+']'; 
			return k+'='+m;
		});

	if(n === 0)
		return 'msg='+String(addition);
	return String(addition);
}

/**
 * @method writeTo
 * @param {String} [type]
 * @param {String} [header]
 * @param {String} [writeOptions]
 * @param {String} [msg]
 */
Log.prototype.writeTo = function(type, header, writeOptions, msg) {
	var s = this[type+'Cursors'] || [];

	for(var i=0; i<s.length; i++) {
		if(writeOptions.headerColor) {
			s[i].rgb(writeOptions.headerColor[0], writeOptions.headerColor[1], writeOptions.headerColor[2]);
		}
		s[i].write(header)
		s[i].fg.reset();
		if(writeOptions.color) {
			s[i].rgb(writeOptions.color[0], writeOptions.color[1], writeOptions.color[2]);
		}
		s[i].write(msg+'\n');
		s[i].fg.reset();
	}
}

/**
 * @method write
 */
Log.prototype.log = Log.prototype.write = function() {
	if(this.paused) return;

	var a = _.map(arguments, function(x){ return x; }),
		ts = moment().format('YYYY-MM-DDTHH:mm:ssZZ'),
		msg = '', writeOptions = {}, header, l, i, c;

	if(this.options.levels.indexOf(a[0]) === -1 && a[0] !== 'd'){
		l = this.options.defaultLevel;
	} else {
		l = a[0];
		a.splice(0, 1);
	}

	if(!a.length) return;

	if(this.options.color && this.options.colors[l])
		c = this.options.colors[l];

	for(i=0; i<a.length; i++) {
		if(i > 0) msg += ',';
		msg += ' ' + this.parseMsg(a[i]);
	}

	header = ts + ' l='+l.slice(0, 1).toUpperCase() + ' pid=' + process.pid;

	if(l === 'd') {
		writeOptions.headerColor = this.options.dColor;
		writeOptions.color = this.options.dColor;
		if(this.options.d) this.writeTo('d', header, writeOptions, msg);
		return;
	}

	writeOptions = {headerColor: c};
	if(this.stderrMap[l]) this.writeTo('stderr', header, writeOptions, msg);
	if(this.stdoutMap[l]) this.writeTo('stdout', header, writeOptions, msg);
}

/**
 * @method trace
 */
Log.prototype.trace = function() {
	var a = _.map(arguments, function(x){ return x; });
	var e = a.splice(0, 1)[0];
	a.unshift(e.message, e.stack);
	this.error.apply(this, a);
}

/**
 * @method pause
 */
Log.prototype.pause = function() {
	this.paused = true;
}

/**
 * @method resume
 */
Log.prototype.resume = function() {
	this.paused = false;
}
