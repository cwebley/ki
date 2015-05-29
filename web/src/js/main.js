var App = require('./components/app'),
	React = require('react'),
	a11y = require('react-a11y'), // browser console helper. can be removed later.
	api = require('./utils/api'),
    Router = require('react-router'),
    Route = Router.Route,
    DefaultRoute = Router.DefaultRoute,
    NotFoundRoute = Router.NotFoundRoute,
    AboutPage = require('./pages/about'),
    TourneyIndex = require('./pages/tournament-index'),
    TourneyPage = require('./pages/tournament'),
    StatsPage = require('./pages/stats'),
    FaqPage = require('./pages/faq'),
    LoginPage = require('./pages/login'),
    Authentication = require('./mixins/Authentication')
    NotFound = require('./pages/404');

var routes = (
    <Route name="app" path="/" handler={App}>
        <Route name="about" handler={AboutPage}/>
        <Route name="stats" handler={StatsPage}/>
        <Route name="tournaments" handler={TourneyIndex} >
            <Route name="tournament" path=":title" handler={TourneyPage} />
        </Route>
        <Route name="faq" handler={FaqPage}/>
        <Route name="login" handler={LoginPage}/>
        <DefaultRoute handler={AboutPage}/>
        <NotFoundRoute handler={NotFound}/>
    </Route>
);

Router.run(routes, function (Handler) {
  React.render(<Handler/>, document.getElementById('root'))
});