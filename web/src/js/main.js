var App = require('./components/app'),
	React = require('react'),
	a11y = require('react-a11y'), // browser console helper. can be removed later.
	api = require('./utils/api'),
    Router = require('react-router'),
    Route = Router.Route,
    DefaultRoute = Router.DefaultRoute,
    NotFoundRoute = Router.NotFoundRoute,
    AboutPage = require('./pages/about'),
    TourneyPage = require('./pages/tournaments'),
    StatsPage = require('./pages/stats'),
    FaqPage = require('./pages/faq'),
    LoginPage = require('./pages/login'),
    Authentication = require('./mixins/Authentication')
    NotFound = require('./pages/404');

//TODO: req param when router used.
// var tourneyName = 'ReturningChamp-Obvi' 
api.getTournamentIndex() // load tournament data for first time into store.

var routes = (
    <Route name="app" path="/" handler={App}>
        <Route name="about" handler={AboutPage}/>
        <Route name="stats" handler={StatsPage}/>
        <Route name="tournaments" handler={TourneyPage} />
        <Route name="faq" handler={FaqPage}/>
        <Route name="login" handler={LoginPage}/>
        <DefaultRoute handler={AboutPage}/>
        <NotFoundRoute handler={NotFound}/>
    </Route>
);

Router.run(routes, function (Handler) {
  React.render(<Handler/>, document.getElementById('root'))
});