var faker = require('faker');
var range = require('lodash.range');

var NUMBER_OF_CHARACTERS = 22;

module.exports = range(0, NUMBER_OF_CHARACTERS).map(function (i) {
	var season = 1;
	if (i > NUMBER_OF_CHARACTERS / 2) {
		season = 2;
	}
	var characterData = {
		name: faker.helpers.userCard().name,
		season: season
	};
	return characterData;
});
