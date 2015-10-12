import { expect } from 'chai';
import { submitGame } from '../core.js'

let initialState = {
	users: {
		1: {
			name: 'g',
			score: 0,
			streak: {
				current: 0,
				best: 0
			},
			characters: {
				1: {
					name: "Jago",
					streak: {
						current: 0,
						best: 0
					}
				},
				2: {
					name: "Sabrewulf",
					streak: {
						current: 0,
						best: 0
					}
				}
			}
		},
		2: {
			name: 'bj',
			score: 0,
			streak: {
				current: 0,
				best: 0
			},
			characters: {
				1: {
					name: "Jago",
					streak: {
						current: 0,
						best: 0
					}
				},
				2: {
					name: "Sabrewulf",
					streak: {
						current: 0,
						best: 0
					}
				}
			}
		}
	}
}

describe('core logic', () => {

	describe('submitGame', () => {
		it('doesnt change the data', () => {
			let resp = submitGame(initialState);
			expect(resp.nextState).to.equal(initialState)
		});
	});

});