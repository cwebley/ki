import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import configureStore from './configure-store';
import Root from './components/root';

// Needed for onTouchTap
// Can go away when react 1.0 release
// Check this repo:
// https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();

ReactDOM.render(<Root store={configureStore()}/>,
	document.getElementById('root'));
