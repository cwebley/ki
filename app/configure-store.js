import { createStore, applyMiddleware } from 'redux';
import { loadState } from './local-storage';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';
import storeReducer from './store';

const configureStore = () => {
	const store = createStore(
		storeReducer,
		loadState(),
		applyMiddleware(thunk, createLogger())
	);
	return store;
}

export default configureStore;
