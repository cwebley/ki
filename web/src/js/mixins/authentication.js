// waiting for react-router 1.0 to deal with this

var auth = require('../utils/auth'),
	LoginPage = require('../pages/login');

var Authentication = {
	statics: {
		willTransitionTo: function (transition) {
			if (!auth.loggedIn()) {
				LoginPage.attemptedTransition = transition;
				transition.redirect('/login');
			}
		}
	}
};	