var users = require('../data/users');
var request = require('request');

module.exports.up = function (next) {
	var run = 0;
	var errors = null;

	// saving userUuids for teardown
	this.state.tokens = [];

	users.forEach(function (user, i, done) {
		request({
			method: 'POST',
			url: 'http://localhost:3000/api/user/register',
			json: true,
			body: user
		}, function (err, resp, body) {
			if (!err && resp.statusCode > 300) {
				err = new Error('Non 200 response: ' + resp.statusCode);
			}
			if (err) {
				if(!errors) {
					errors = [err];
				} else {
					errors.push(err);
				}
			}

			if (!err && body) {
				this.state.tokens.push(body.token);
			}

			run++;
			if (run === users.length) {
				next(errors);
			}
		}.bind(this));
	}.bind(this));
};

module.exports.down = function (next) {
	next();
};
