import * as c from './constants';

export const getToken = () => {
	try {
		const token = localStorage.getItem(c.TOKEN_PROPERTY);
		return token;
	}
	catch (err) {
		return undefined;
	}
};

export const saveToken = (token) => {
	try {
		return localStorage.setItem(c.TOKEN_PROPERTY, token);
	}
	catch (err) {
		return;
	}
};
