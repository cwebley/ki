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

export const createTournament = (formData, token) =>
	new Promise((resolve, reject) => {
		nets({
			method: 'POST',
			url: config.apiBase + config.tournamentsPath,
			json: formData,
			headers: {
				Authorization: 'Bearer ' + token
			}
		}, (err, resp, body) => {
			if (err || resp.statusCode >= 400) {
				return reject(body);
			}
			resolve(body);
		});
	});

export const fetchTournament = (tournamentSlug, token) => {
	let headers = {};
	if (token) {
		headers['Authorization']  = 'Bearer ' + token;
	}
	return new Promise((resolve, reject) => {
		nets({
			url: config.apiBase + config.singleTournamentPath + '/' + tournamentSlug,
			json: true,
			headers
		}, (err, resp, body) => {
			if (err || resp.statusCode >= 400) {
				return reject(body);
			}
			resolve(body);
		});
	});
}

export const submitSeeds = (tournamentSlug, seedValues, token) =>
	new Promise((resolve, reject) => {
		nets({
			url: config.apiBase + config.singleTournamentPath + '/' + tournamentSlug + '/seed',
			json: seedValues,
			method: 'POST',
			headers: {
				Authorization: 'Bearer ' + token
			}
		}, (err, resp, body) => {
			if (err || resp.statusCode >= 400) {
				return reject(body);
			}
			resolve(body);
		});
	});

export const draftCharacter = (tournamentSlug, characterSlug, token) =>
	new Promise((resolve, reject) => {
		nets({
			url: config.apiBase + config.singleTournamentPath + '/' + tournamentSlug + '/draft',
			json: {
				pick: characterSlug
			},
			method: 'POST',
			headers: {
				Authorization: 'Bearer ' + token
			}
		}, (err, resp, body) => {
			if (err || resp.statusCode >= 400) {
				return reject(body);
			}
			resolve(body);
		});
	});

export const submitGame = opts => {
	const { token, tournamentSlug, ...gameData } = opts;
	return new Promise((resolve, reject) => {
		nets({
			url: config.apiBase + config.singleTournamentPath + '/' + tournamentSlug + '/game',
			json: gameData,
			method: 'POST',
			headers: {
				Authorization: 'Bearer ' + token
			}
		}, (err, resp, body) => {
			if (err || resp.statusCode >= 400) {
				return reject(body);
			}
			resolve(body);
		});
	});
};

export const rematch = (tournamentSlug, token) => new Promise((resolve, reject) => {
	nets({
		url: config.apiBase + config.singleTournamentPath + '/' + tournamentSlug + '/power/rematch',
		method: 'POST',
		json: {},
		headers: {
			Authorization: 'Bearer ' + token
		}
	}, (err, resp, body) => {
		if (err || resp.statusCode >= 400) {
			return reject(body);
		}
		resolve(body);
	});
});

export const oddsmaker = (character, tournamentSlug, token) => new Promise((resolve, reject) => {
	nets({
		url: config.apiBase + config.singleTournamentPath + '/' + tournamentSlug + '/power/oddsmaker',
		method: 'POST',
		json: {
			characterSlug: character.slug
		},
		headers: {
			Authorization: 'Bearer ' + token
		}
	}, (err, resp, body) => {
		if (err || resp.statusCode >= 400) {
			return reject(body);
		}
		resolve(body);
	});
});

export const decrementCharacter = (character, tournamentSlug, token) => new Promise((resolve, reject) => {
	nets({
		url: config.apiBase + config.singleTournamentPath + '/' + tournamentSlug + '/power/decrement',
		method: 'POST',
		json: {
			characterSlug: character.slug
		},
		headers: {
			Authorization: 'Bearer ' + token
		}
	}, (err, resp, body) => {
		if (err || resp.statusCode >= 400) {
			return reject(body);
		}
		resolve(body);
	});
});
