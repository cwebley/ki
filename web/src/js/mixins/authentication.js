// waiting for react-router 1.0 to deal with this

var AuthStore = require('../stores/auth-store'),
	LoginPage = require('../pages/login');

var Authentication = {
	statics: {
		willTransitionTo: function (transition) {
			if (!AuthStore.loggedIn()) {
				LoginPage.attemptedTransition = transition;
				transition.redirect('/login');
			}
		}
	}
};	