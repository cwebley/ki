import { expect } from 'chai';
import { submitGame } from '../core.js';

// initial values for the test state
let userOneScore = 0;
let userOneStreak = 0;
let userOnePowers = 3;
let userOneXterOneVal = 6;
let userOneXterOneStreak = 0;
let userOneXterTwoVal = 3;
let userOneXterTwoStreak = 0;

let userTwoScore = 0;
let userTwoStreak = 0;
let userTwoPowers = 3;
let userTwoXterOneVal = 5;
let userTwoXterOneStreak = 0;
let userTwoXterTwoVal = 2;
let userTwoXterTwoStreak = 0;

// getters allow each of these values to be customized succinctly in tests
let testState = {
	users: {
		1: {
			get score() { return userOneScore },
			get streak() { return userOneStreak },
			get powers() { return userOnePowers },
			characters: {
				1: {
					get value() { return userOneXterOneVal },
					get streak() { return userOneXterOneStreak }
				},
				2: {
					get value() { return userOneXterTwoVal },
					get streak() { return userOneXterTwoStreak }
				}
			}
		},
		2: {
			get score() { return userTwoScore },
			get streak() { return userTwoStreak },
			get powers() { return userTwoPowers },
			characters: {
				1: {
					get value() { return userTwoXterOneVal },
					get streak() { return userTwoXterOneStreak }
				},
				2: {
					get value() { return userTwoXterTwoVal },
					get streak() { return userTwoXterTwoStreak }
				}
			}
		}
	}
};

describe('core logic', () => {

	describe('submitGame', () => {

		let supremeTest = false;
		const testGame = {
			winner: {
				playerId: 1,
				characterId: 1
			},
			loser: {
				playerId: 2,
				characterId: 2
			},
			get supreme() { return supremeTest }
		};

		it('increments winning player\'s score based on the character value', () => {
			const diff = submitGame(testState, testGame);
			expect(diff["1"].score).to.equal(userOneXterOneVal);
			expect(diff["2"].score).to.equal(undefined); // no change for the loser

			// update the scores and run again to make sure it factors in the current score
			userOneScore = 10;
			const diff2 = submitGame(testState, testGame);
			expect(diff2["1"].score).to.equal(userOneScore + userOneXterOneVal);
			expect(diff2["2"].score).to.equal(undefined); // no change for the loser
		});

		it('handles player and character streaks properly', () => {

			const diff = submitGame(testState, testGame);
			expect(diff["1"].streak).to.equal(1);
			expect(diff["1"].characters["1"].streak).to.equal(1);
			expect(diff["2"].streak).to.equal(-1);
			expect(diff["2"].characters["2"].streak).to.equal(-1);

			// ensure it can incr/decr properly
			userOneStreak = 1;
			userOneXterOneStreak = 1;
			userTwoStreak = -1;
			userTwoXterTwoStreak = -1;

			const diff2 = submitGame(testState, testGame);
			expect(diff2["1"].streak).to.equal(2);
			expect(diff2["1"].characters["1"].streak).to.equal(2);
			expect(diff2["2"].streak).to.equal(-2);
			expect(diff2["2"].characters["2"].streak).to.equal(-2);

			// ensure it resets negative streaks to positive and vice versa
			userOneStreak = -5;
			userOneXterOneStreak = -5;
			userTwoStreak = 5;
			userTwoXterTwoStreak = 5;

			const diff3 = submitGame(testState, testGame);
			expect(diff3["1"].streak).to.equal(1);
			expect(diff3["1"].characters["1"].streak).to.equal(1);
			expect(diff3["2"].streak).to.equal(-1);
			expect(diff3["2"].characters["2"].streak).to.equal(-1);

		});

		it('increments the winners powers only on supreme', () => {
			// no supreme
			const diff = submitGame(testState, testGame);
			expect(diff["1"].powers).to.equal(undefined); // no power change if no supreme
			expect(diff["2"].powers).to.equal(undefined); // no power change for the loser ever

			// supreme
			supremeTest = true;
			const diff2 = submitGame(testState, testGame);
			expect(diff2["1"].powers).to.equal(userOnePowers + 1);
			expect(diff2["2"].powers).to.equal(undefined); // no power change for the loser ever
		});
	});

});