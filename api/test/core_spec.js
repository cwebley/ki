import { expect } from 'chai';
import { submitGame, undoGame } from '../core.js';

// these values are set manually in tests, or all at once when resetTestState() is called
let userOneScore;
let userOneStreak;
let userOnePowers;
let userOneXterOneVal;
let userOneXterOneStreak;
let userOneXterTwoVal;
let userOneXterTwoStreak;

let userTwoScore;
let userTwoStreak;
let userTwoPowers;
let userTwoXterOneVal;
let userTwoXterOneStreak;
let userTwoXterTwoVal;
let userTwoXterTwoStreak;

let supremeTest;
let lastGameWasForOnePoint;

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

const testUndoGame = {
	winner: {
		playerId: 1,
		characterId: 1,
		get prevCharVal() { 
			if ( lastGameWasForOnePoint ) {
				return 1;
			}
			return userOneXterOneVal + 1
		}
	},
	loser: {
		playerId: 2,
		characterId: 2,
		get prevCharVal() { 
			if ( userTwoXterTwoVal > 1 ) {
				return userTwoXterTwoVal - 1;
			}
			return userTwoXterTwoVal;
		}
	},
	get supreme() { return supremeTest }
};

function resetTestState() {
	userOneScore = 0;
	userOneStreak = 0;
	userOnePowers = 3;
	userOneXterOneVal = 6;
	userOneXterOneStreak = 0;
	userOneXterTwoVal = 3;
	userOneXterTwoStreak = 0;

	userTwoScore = 0;
	userTwoStreak = 0;
	userTwoPowers = 3;
	userTwoXterOneVal = 5;
	userTwoXterOneStreak = 0;
	userTwoXterTwoVal = 2;
	userTwoXterTwoStreak = 0;

	supremeTest = false;
	lastGameWasForOnePoint = false;
};

describe('core logic', () => {

	describe('submitGame', () => {
		beforeEach((done) => {
			resetTestState();
			done();
		});

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

		it('handles character value changes', () => {
			const diff = submitGame(testState, testGame);

			expect(diff["1"].characters["1"].value).to.equal(userOneXterOneVal - 1);
			expect(diff["2"].characters["2"].value).to.equal(userTwoXterTwoVal + 1);
		});

		it('handles the edge case of the winning character already having a value of 1', () => {

			userOneXterOneVal = 1;
			const diff = submitGame(testState, testGame);

			expect(diff["1"].characters["1"].value).to.equal(undefined); // no change in character value for the winner
			expect(diff["2"].characters["2"].value).to.equal(userTwoXterTwoVal + 1);
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

		it('increments the winner\'s powers only on supreme', () => {
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

	describe('undoGame', () => {
		beforeEach((done) => {
			resetTestState();
			done();
		});

		it('decrements winning player\'s score based on the winning character\'s previous value', () => {
			// give the user some non-zero score
			userOneScore = 50;

			const diff = undoGame(testState, testUndoGame);

			// one less than the current value since it was decr'd after the win
			expect(diff["1"].score).to.equal(userOneScore - testUndoGame.winner.prevCharVal);
			expect(diff["2"].score).to.equal(undefined); // no change for the loser
		});

		it('resets the character values properly', () => {
			const diff = undoGame(testState, testUndoGame);

			expect(diff["1"].characters["1"].value).to.equal(userOneXterOneVal + 1);
			expect(diff["2"].characters["2"].value).to.equal(userTwoXterTwoVal - 1);
		});

		it('handles the edge case of the winning character value being 1 after the the last game', () => {

			userOneXterOneVal = 1;
			lastGameWasForOnePoint = true;

			const diff = undoGame(testState, testUndoGame);

			// winner score is one less than the current value like normal
			expect(diff["1"].score).to.equal(userOneScore - testUndoGame.winner.prevCharVal);

			expect(diff["1"].characters["1"].value).to.equal(undefined); // no change in character value for the winner
			expect(diff["2"].characters["2"].value).to.equal(userTwoXterTwoVal - 1);
		});


		it('handles undoing the winning player and character streaks properly', () => {

			userOneStreak = 5;
			userOneXterOneStreak = 5;
			userTwoStreak = -5;
			userTwoXterTwoStreak = -5;

			const diff = undoGame(testState, testUndoGame);
			expect(diff["1"].streak).to.equal(4);
			expect(diff["1"].characters["1"].streak).to.equal(4);

			expect(diff["2"].streak).to.equal(-4);
			expect(diff["2"].characters["2"].streak).to.equal(-4);
		});

		it('handles the ambigous streak case by resetting streaks to 0', () => {
			userOneStreak = 1;
			userOneXterOneStreak = 1;
			userTwoStreak = -1;
			userTwoXterTwoStreak = -1;

			const diff = undoGame(testState, testUndoGame);
			expect(diff["1"].streak).to.equal(0);
			expect(diff["1"].characters["1"].streak).to.equal(0);

			expect(diff["2"].streak).to.equal(0);
			expect(diff["2"].characters["2"].streak).to.equal(0);
		});

		it('decrements the winner\'s when prev game was a supreme', () => {
			// no supreme
			const diff = undoGame(testState, testUndoGame);
			expect(diff["1"].powers).to.equal(undefined); // no power change if no supreme
			expect(diff["2"].powers).to.equal(undefined); // no power change for the loser ever

			// supreme
			supremeTest = true;
			const diff2 = undoGame(testState, testUndoGame);
			expect(diff2["1"].powers).to.equal(userOnePowers - 1);
			expect(diff2["2"].powers).to.equal(undefined); // no power change for the loser ever
		});
	});

});