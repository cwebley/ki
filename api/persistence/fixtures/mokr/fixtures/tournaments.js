var tournaments = require('../data/test');
var request = require('request');

module.exports.up = function (next) {
	var run = 0;
	var errors = null;

	// saving tournaments for teardown
	this.state.tournaments = [];

	tournaments.forEach(function (tournament, i, done) {
		request({
			method: 'POST',
			url: 'http://localhost:3000/api/tournament',
			json: true,
			body: tournament
		}, function (err, resp, body) {
			if (!err && resp.statusCode > 300) {
				err = new Error('Non 200 response');
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
			if (run === tournaments.length) {
				next(errors);
			}
		}.bind(this));
	}.bind(this));
};

module.exports.down = function (next) {
	next();
};
