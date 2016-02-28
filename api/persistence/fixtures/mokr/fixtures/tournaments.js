var tournaments = require('../data/tournaments');
var request = require('request');

module.exports.dependsOn = ['users'];

module.exports.up = function (next) {
	var run = 0;
	var errors = null;

	var tokenFromUserFixture = this.dependencies.users.state.tokens[0];

	// saving tournaments for teardown
	this.state.tournaments = [];

	tournaments.forEach(function (tournament) {
		request({
			method: 'POST',
			url: 'http://localhost:3000/api/tournament',
			json: true,
			headers: {
				'Authorization': 'Bearer ' + tokenFromUserFixture
			},
			body: tournament
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
				this.state.tournaments.push(body);
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
