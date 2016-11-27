import nets from 'nets';
import * as config from '../config';

export const login = (formData) =>
	new Promise((resolve, reject) => {
		nets({
			method: 'POST',
			url: config.loginPath,
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
			url: config.registerPath,
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
			url: config.charactersPath,
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
			url: config.tournamentsPath,
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
		headers['Authorization'] = 'Bearer ' + token;
	}
	return new Promise((resolve, reject) => {
		nets({
			url: config.singleTournamentPath + '/' + tournamentSlug,
			json: true,
			headers
		}, (err, resp, body) => {
			if (err || resp.statusCode >= 400) {
				return reject(body);
			}
			resolve(body);
		});
	});
};

export const submitSeeds = (tournamentSlug, seedValues, token) =>
	new Promise((resolve, reject) => {
		nets({
			url: config.singleTournamentPath + '/' + tournamentSlug + '/seed',
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
			url: config.singleTournamentPath + '/' + tournamentSlug + '/draft',
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
			url: config.singleTournamentPath + '/' + tournamentSlug + '/game',
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
		url: config.singleTournamentPath + '/' + tournamentSlug + '/power/rematch',
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

export const oddsmaker = (characterSlug, tournamentSlug, token) => new Promise((resolve, reject) => {
	nets({
		url: config.singleTournamentPath + '/' + tournamentSlug + '/power/oddsmaker',
		method: 'POST',
		json: {
			characterSlug
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

export const decrementCharacter = (characterSlug, tournamentSlug, token) => new Promise((resolve, reject) => {
	nets({
		url: config.singleTournamentPath + '/' + tournamentSlug + '/power/decrement',
		method: 'POST',
		json: {
			characterSlug
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

export const undoLastGame = (tournamentSlug, token) => new Promise((resolve, reject) => {
	nets({
		url: config.singleTournamentPath + '/' + tournamentSlug + '/game',
		method: 'DELETE',
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

export const extendTournament = (tournamentSlug, newGoal, token) => new Promise((resolve, reject) => {
	nets({
		url: config.singleTournamentPath + '/' + tournamentSlug,
		method: 'PUT',
		json: {
			goal: newGoal
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

export const useInspect = (tournamentSlug, token) => new Promise((resolve, reject) => {
	nets({
		url: config.singleTournamentPath + '/' + tournamentSlug + '/power/inspect',
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

export const updateMatchups = (tournamentSlug, matchupData, token) => new Promise((resolve, reject) => {
	nets({
		url: config.singleTournamentPath + '/' + tournamentSlug + '/power/inspect',
		method: 'PUT',
		json: {
			matchups: matchupData
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

export const fetchTournamentIndex = (token) => {
	let headers = {};
	if (token) {
		headers['Authorization'] = 'Bearer ' + token;
	}

	return new Promise((resolve, reject) => {
		nets({
			url: config.tournamentsPath,
			json: true,
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

/*
[{
	uuid: 'abc',
	name: 'foo',
	slug: 'foo',
	goal: 125,
	championUuid: 'asdf',
	active: false,
	users: {
		ids: {
			asdf: {
				score: 125,
				name: 'g',
				'slug': 'g'
			},
			sdfg: {
				score: 100,
				name: 'bj',
				'slug': 'bj'}
			},
		result: ['asdf', 'sdfg']
	}
}, {
		uuid: 'bcd',
		name: 'bar',
		slug: 'bar',
		goal: 125,
		championUuid: 'asdf',
		active: false,
		users: {
			ids: {
				asdf: {
					score: 100,
					name: 'bj',
					'slug': 'bj'
				},
				sdfg: {
					score: 125,
					name: 'g',
					'slug': 'g'}
				},
			result: ['asdf', 'sdfg']
		}
	}
]
*/
