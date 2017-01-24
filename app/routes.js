import React from 'react';
import { Router, Route, browserHistory } from 'react-router';

// Layout
import MainLayout from './components/main-layout';

// Pages
import Home from './components/home';
import Register from './components/register';
import SignIn from './components/sign-in';
import TournamentCreator from './components/tournament-creator';
import TournamentIndex from './components/tournament-index';
import TournamentStatsContainer from './containers/tournament-stats-container';
import TournamentLanding from './components/tournament-landing';

const Routes = () => (
	<Router history={browserHistory}>
		<Route component={MainLayout}>
			<Route path="/" component={Home} />
			<Route path="/register" component={Register} />
			<Route path="/sign-in" component={SignIn} />
			<Route path="/create" component={TournamentCreator} />
			<Route path="/tournaments" component={TournamentIndex} />
			<Route path="/tournament/:tournamentSlug/stats" component={TournamentStatsContainer} />
			<Route path="/:tournamentSlug" component={TournamentLanding} />
		</Route>
	</Router>
);

export default Routes;
