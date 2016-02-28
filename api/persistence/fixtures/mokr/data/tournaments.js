var faker = require('faker');
var range = require('lodash.range');

module.exports = range(0, 5).map(function () {
	return {
		// whatever
		name: faker.internet.domainName(),

		// random int between 50 and 250
		goal: Math.floor(Math.random() * (250 - 50)) + 50,
	}
});
