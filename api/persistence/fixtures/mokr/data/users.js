var faker = require('faker');
var range = require('lodash.range');

// needs at least 2 users for the touranments fixture to work
const NUMBER_OF_USERS = 2;

module.exports = range(0, NUMBER_OF_USERS).map(function () {
	var user = {};
	var fakeUser = faker.helpers.userCard();

	user.username = fakeUser.name;
	user.email = fakeUser.email;
	user.password = 'asdfasdf';
	user.confirmPassword = 'asdfasdf';
	return user;
});
