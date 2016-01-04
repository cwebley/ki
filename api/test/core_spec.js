import { expect } from 'chai';
import { 
	updateLoserValue, 
	updateWinnerValue, 
	updateWinningStreak, 
	updateLosingStreak, 
	fireStatus, 
	iceStatus, 
	submitGame, 
	undoGame,
	updateStreakPoints,
	undoLoserStreak,
	undoWinnerStreak
} from '../core.js';

// these values are set manually in tests, or all at once when resetTestState() is called
let userOneScore;
let userOneStreak;
let userOnePowers;
let userOneStreakPoints;
let userOneXterOneVal;
let userOneXterOneStreak;
let userOneXterTwoVal;
let userOneXterTwoStreak;

let userTwoScore;
let userTwoStreak;
let userTwoPowers;
let userTwoStreakPoints;
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
			get streakPoints() { return userOneStreakPoints },
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
			get streakPoints() { return userTwoStreakPoints },
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
	userOneStreakPoints = 3;
	userOneXterOneVal = 6;
	userOneXterOneStreak = 0;
	userOneXterTwoVal = 3;
	userOneXterTwoStreak = 0;

	userTwoScore = 0;
	userTwoStreak = 0;
	userTwoPowers = 3;
	userTwoStreakPoints = 2;
	userTwoXterOneVal = 5;
	userTwoXterOneStreak = 0;
	userTwoXterTwoVal = 2;
	userTwoXterTwoStreak = 0;

	supremeTest = false;
	lastGameWasForOnePoint = false;
};

describe('core logic', () => {

	describe('updateWinnerValue', () => {
		it('decrements value when previousValue > 1', () => {
			expect(updateWinnerValue(2)).to.equal(1);
			expect(updateWinnerValue(3)).to.equal(2);
			expect(updateWinnerValue(1000)).to.equal(999);
		});
		it('respects the 1 point floor and returns undefined if no change', () => {
			expect(updateWinnerValue(1)).to.equal(undefined);
		});
	});

	describe('updateLoserValue', () => {
		it('increments value when previousValue', () => {
			expect(updateLoserValue(2)).to.equal(3);
			expect(updateLoserValue(3)).to.equal(4);
			expect(updateLoserValue(1000)).to.equal(1001);
		});
	});

	describe('updateWinningStreak', () => {
		it('increments streak when streak is above 0', () => {
			expect(updateWinningStreak(1)).to.equal(2);
			expect(updateWinningStreak(2)).to.equal(3);
			expect(updateWinningStreak(999)).to.equal(1000);
		});
		it('returns 1 when a win streak is not active', () => {
			expect(updateWinningStreak(0)).to.equal(1);
			expect(updateWinningStreak(-1)).to.equal(1);
			expect(updateWinningStreak(-2)).to.equal(1);
			expect(updateWinningStreak(-999)).to.equal(1);
		});
	});

	describe('updateLosingStreak', () => {
		it('decrements streak when streak is below 0', () => {
			expect(updateLosingStreak(-1)).to.equal(-2);
			expect(updateLosingStreak(-2)).to.equal(-3);
			expect(updateLosingStreak(-999)).to.equal(-1000);
		});
		it('returns -1 when no streak is active or a win streak just ended', () => {
			expect(updateLosingStreak(0)).to.equal(-1);
			expect(updateLosingStreak(1)).to.equal(-1);
			expect(updateLosingStreak(2)).to.equal(-1);
			expect(updateLosingStreak(999)).to.equal(-1);
		});
	});

	describe('updateStreakPoints', () => {
		it('increments streak points when new previousStreak is 2 or >= 4', () => {
			expect(updateStreakPoints(0, 2)).to.equal(1);
			expect(updateStreakPoints(1, 2)).to.equal(2);
			expect(updateStreakPoints(1, 4)).to.equal(2);
			expect(updateStreakPoints(1, 5)).to.equal(2);
			expect(updateStreakPoints(999, 999)).to.equal(1000);
		});
	});

	describe('fireStatus', () => {
		it('returns undefined when previous streak is not 3', () => {
			expect(fireStatus('1', 1)).to.equal(undefined);
			expect(fireStatus('1', 3)).to.equal(undefined);
			expect(fireStatus('1', 4)).to.equal(undefined);
			expect(fireStatus('1', 999)).to.equal(undefined);
		});
		it('returns the characterId string when previous streak is 2', () => {
			const charIdStr = "1";
			expect(fireStatus(charIdStr, 2)).to.equal(charIdStr);
		});
	});

	describe('iceStatus', () => {
		it('returns undefined when previous streak is less than 3', () => {
			expect(iceStatus('1', 0)).to.equal(undefined);
			expect(iceStatus('1', 1)).to.equal(undefined);
			expect(iceStatus('1', 2)).to.equal(undefined);
		});
		it('returns the characterId string when previous streak is greater than 3', () => {
			const charIdStr = "1";
			expect(iceStatus(charIdStr, 3)).to.equal(charIdStr);
			expect(iceStatus(charIdStr, 4)).to.equal(charIdStr);
			expect(iceStatus(charIdStr, 999)).to.equal(charIdStr);
		});
	});

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

		it('updates streak points for the winner only when previousStreak is 2 or >= 4 streaks', () => {

			userOneStreak = 2;
			const diff = submitGame(testState, testGame);

			expect(diff["1"].streakPoints).to.equal(userOneStreakPoints + 1);
			expect(diff["2"].streakPoints).to.equal(undefined);

			userOneStreak = 4;
			expect(submitGame(testState, testGame)["1"].streakPoints).to.equal(userOneStreakPoints + 1);
			userOneStreak = 999;
			expect(submitGame(testState, testGame)["1"].streakPoints).to.equal(userOneStreakPoints + 1);

			// no update if current streak after this game is less than 3, or 4
			userOneStreak = -5;
			expect(submitGame(testState, testGame)["1"].streakPoints).to.equal(undefined);
			userOneStreak = 0;
			expect(submitGame(testState, testGame)["1"].streakPoints).to.equal(undefined);
			userOneStreak = 1;
			expect(submitGame(testState, testGame)["1"].streakPoints).to.equal(undefined);
			userOneStreak = 3;
			expect(submitGame(testState, testGame)["1"].streakPoints).to.equal(undefined);
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

		it('returns fire character\'s id if winning character exactly on a 3 streak', () => {
			// character on a 0 streak
			const diff = submitGame(testState, testGame);
			expect(diff["1"].fire).to.equal(undefined);

			// supreme
			userOneXterOneStreak = 2;
			const diff2 = submitGame(testState, testGame);
			expect(diff2["1"].fire).to.equal('1');
		});
	});

	describe('undoWinnerStreak', () => {
		it('decrements streak when streak is above 1', () => {
			expect(undoWinnerStreak(2)).to.equal(1);
			expect(undoWinnerStreak(3)).to.equal(2);
			expect(undoWinnerStreak(1000)).to.equal(999);
		});
		it('returns 0 when there is not enough information to determine previous streak', () => {
			expect(undoWinnerStreak(0)).to.equal(0);
			expect(undoWinnerStreak(-1)).to.equal(0);
			expect(undoWinnerStreak(-2)).to.equal(0);
		});
	});

	describe('undoLoserStreak', () => {
		it('increments streak when streak is below -1', () => {
			expect(undoLoserStreak(-2)).to.equal(-1);
			expect(undoLoserStreak(-3)).to.equal(-2);
			expect(undoLoserStreak(-1000)).to.equal(-999);
		});
		it('returns 0 when there is not enough information to determine previous streak', () => {
			expect(undoLoserStreak(0)).to.equal(0);
			expect(undoLoserStreak(1)).to.equal(0);
			expect(undoLoserStreak(2)).to.equal(0);
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