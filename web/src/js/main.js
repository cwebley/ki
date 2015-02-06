var App = require('./components/app'),
	React = require('react'),
	a11y = require('react-a11y'), // browser console helper. can be removed later.
	api = require('./utils/api');

//TODO: req param when router used.
var tourneyName = 'ReturningChamp-Obvi' 
api.getTournament(tourneyName) // load tournament data for first time into store.


React.render(
	<App />,
	document.getElementById('main')
);