/* global localStorage */

import * as c from './constants';

export const loadState = () => {
	try {
		const serializedState = localStorage.getItem(c.LOCAL_STORAGE_PROPERTY);
		if (serializedState === null) {
			return undefined;
		}
		return JSON.parse(serializedState);
	} catch (err) {
		return undefined;
	}
};

export const saveState = (state) => {
	try {
		// don't stringify null or undefined
		const serializedState = state ? JSON.stringify(state) : state;
		return localStorage.setItem(c.LOCAL_STORAGE_PROPERTY, serializedState);
	} catch (err) {
		return undefined;
	}
};
