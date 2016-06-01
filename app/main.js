import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';
import store from './store';

import Router from './router';

// Needed for onTouchTap
// Can go away when react 1.0 release
// Check this repo:
// https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();

const reduxMiddleware = applyMiddleware(thunk, createLogger());

ReactDOM.render(<Provider store={compose(reduxMiddleware)(createStore)(store)}>
	{Router}
</Provider>, document.getElementById('root'));
