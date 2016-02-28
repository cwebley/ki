var faker = require('faker');
var range = require('lodash.range');

var NUMBER_OF_CHARACTERS = 27;

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

// Probably not in use
var realCharacters = [{
	name: 'Jago',
	season: 1
},{
	name: 'Sabrewulf',
	season: 1
},{
	name: 'Orchid',
	season: 1
},{
	name: 'Glacius',
	season: 1
},{
	name: 'Thunder',
	season: 1
},{
	name: 'Sadira',
	season: 1
},{
	name: 'Spinal',
	season: 1
},{
	name: 'Fulgore',
	season: 1
},{
	name: 'Shadow Jago',
	season: 1
},{
	name: 'TJ Combo',
	season: 2
},{
	name: 'Maya',
	season: 2
},{
	name: 'Kanra',
	season: 2
},{
	name: 'Riptor',
	season: 2
},{
	name: 'Aganos',
	season: 2
},{
	name: 'Hisako',
	season: 2
},{
	name: 'Cinder',
	season: 2
},{
	name: 'Aria',
	season: 2
},{
	name: 'Omen',
	season: 2
}];
