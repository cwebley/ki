import React from 'react';
import { Router, Route, browserHistory, IndexRoute } from 'react-router';

// Layout
import MainLayout from './components/main-layout';

// Pages
import Home from './components/home';
import Register from './components/register';
import SignIn from './components/sign-in';

export default (
	<Router history={browserHistory}>
		<Route component={MainLayout}>
			<Route path="/" component={Home} />
			<Route path="/register" component={Register} />
			<Route path="/sign-in" component={SignIn} />
		</Route>
	</Router>
);
