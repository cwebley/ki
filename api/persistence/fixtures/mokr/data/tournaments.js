var faker = require('faker');
var range = require('lodash.range');

// there is some race condition with the upserting of rows into user_characters
// upon post to /api/tournament. it doesn't seem to be a major issue, just makes
// simultaneous tournament creation using the same 2 users (like these fixtures do) fail.
const NUMBER_OF_TOURNAMENTS = 1;

module.exports = range(0, NUMBER_OF_TOURNAMENTS).map(function () {
	return {
		// whatever
		name: faker.internet.domainName(),

		// random int between 50 and 250
		goal: Math.floor(Math.random() * (250 - 50)) + 50,

	}
});
