var faker = require('faker');
var range = require('lodash.range');

module.exports = range(0, 20).map(function () {
	var user = {};
	var fakeUser = faker.helpers.userCard();

	user.username = fakeUser.username;
	user.email = fakeUser.email;
	user.password = 'asdfasdf';
	user.confirmPassword = 'asdfasdf';
	return user;
});
