import React from 'react';
import { Router, Route, browserHistory, IndexRoute } from 'react-router';

// Layout
import MainLayout from './components/main-layout';

// Pages
import Home from './components/home';

export default (
	<Router history={browserHistory}>
		<Route component={MainLayout}>
			<Route path="/" component={Home} />
		</Route>
	</Router>
);
