import nets from 'nets';
import * as config from '../config';

export const login = (formData) =>
	new Promise((resolve, reject) => {
		nets({
			method: 'POST',
			url: config.apiBase + config.loginPath,
			json: formData
		}, (err, resp, body) => {
			if (err || resp.statusCode >= 400) {
				return reject(body);
			}
			resolve(body);
		});
	});

export const register = (formData) =>
	new Promise((resolve, reject) => {
		nets({
			method: 'POST',
			url: config.apiBase + config.registerPath,
			json: formData
		}, (err, resp, body) => {
			if (err || resp.statusCode >= 400) {
				return reject(body);
			}
			resolve(body);
		});
	});

export const fetchCharacters = () =>
	new Promise((resolve, reject) => {
		nets({
			url: config.apiBase + config.charactersPath,
			json: true
		}, (err, resp, body) => {
			if (err || resp.statusCode >= 400) {
				return reject(body);
			}
			resolve(body);
		});
	});
