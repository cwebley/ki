var data = require('../data/ki-characters');
var request = require('request');

module.exports.up = function (next) {
	var run = 0;
	var errors = null;

	// saving userUuids for teardown
	this.state.characters = [];

	data.forEach(function (character) {
		request({
			method: 'POST',
			url: 'http://localhost:3000/api/characters',
			json: true,
			body: character
		}, function (err, resp, body) {
			if (!err && resp.statusCode > 300) {
				err = new Error('Non 200 response: ' + resp.statusCode);
			}
			if (err) {
				if (!errors) {
					errors = [err];
				} else {
					errors.push(err);
				}
			}
			if (!err && body) {
				this.state.characters.push(body);
			}

			run++;
			if (run === data.length) {
				next(errors);
			}
		}.bind(this));
	}.bind(this));
};

module.exports.down = function (next) {
	next();
};
