import { expect } from 'chai';
import { testVals, testState, testGame, resetTestState } from './helper';
import {
	updateLoserValue, 
	updateWinnerValue, 
	updateWinningStreak, 
	updateLosingStreak, 
	fireStatus, 
	iceStatus,
	updateStreakPoints, 
	submitGame
} from '../core/submit-game';

describe('submit-game logic', () => {

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
			expect(diff["1"].score).to.equal(testVals.userOneXterOneVal);
			expect(diff["2"].score).to.equal(undefined); // no change for the loser

			// update the scores and run again to make sure it factors in the current score
			testVals.userOneScore = 10;
			const diff2 = submitGame(testState, testGame);
			expect(diff2["1"].score).to.equal(testVals.userOneScore + testVals.userOneXterOneVal);
			expect(diff2["2"].score).to.equal(undefined); // no change for the loser
		});

		it('handles character value changes', () => {
			const diff = submitGame(testState, testGame);

			expect(diff["1"].characters["1"].value).to.equal(testVals.userOneXterOneVal - 1);
			expect(diff["2"].characters["2"].value).to.equal(testVals.userTwoXterTwoVal + 1);
		});

		it('handles the edge case of the winning character already having a value of 1', () => {

			testVals.userOneXterOneVal = 1;
			const diff = submitGame(testState, testGame);

			expect(diff["1"].characters["1"].value).to.equal(undefined); // no change in character value for the winner
			expect(diff["2"].characters["2"].value).to.equal(testVals.userTwoXterTwoVal + 1);
		});

		it('handles player and character streaks properly', () => {

			const diff = submitGame(testState, testGame);
			expect(diff["1"].streak).to.equal(1);
			expect(diff["1"].characters["1"].streak).to.equal(1);
			expect(diff["2"].streak).to.equal(-1);
			expect(diff["2"].characters["2"].streak).to.equal(-1);

			// ensure it can incr/decr properly
			testVals.userOneStreak = 1;
			testVals.userOneXterOneStreak = 1;
			testVals.userTwoStreak = -1;
			testVals.userTwoXterTwoStreak = -1;

			const diff2 = submitGame(testState, testGame);
			expect(diff2["1"].streak).to.equal(2);
			expect(diff2["1"].characters["1"].streak).to.equal(2);
			expect(diff2["2"].streak).to.equal(-2);
			expect(diff2["2"].characters["2"].streak).to.equal(-2);

			// ensure it resets negative streaks to positive and vice versa
			testVals.userOneStreak = -5;
			testVals.userOneXterOneStreak = -5;
			testVals.userTwoStreak = 5;
			testVals.userTwoXterTwoStreak = 5;

			const diff3 = submitGame(testState, testGame);
			expect(diff3["1"].streak).to.equal(1);
			expect(diff3["1"].characters["1"].streak).to.equal(1);
			expect(diff3["2"].streak).to.equal(-1);
			expect(diff3["2"].characters["2"].streak).to.equal(-1);

		});

		it('updates streak points for the winner only when previousStreak is 2 or >= 4 streaks', () => {

			testVals.userOneStreak = 2;
			const diff = submitGame(testState, testGame);

			expect(diff["1"].streakPoints).to.equal(testVals.userOneStreakPoints + 1);
			expect(diff["2"].streakPoints).to.equal(undefined);

			testVals.userOneStreak = 4;
			expect(submitGame(testState, testGame)["1"].streakPoints).to.equal(testVals.userOneStreakPoints + 1);
			testVals.userOneStreak = 999;
			expect(submitGame(testState, testGame)["1"].streakPoints).to.equal(testVals.userOneStreakPoints + 1);

			// no update if current streak after this game is less than 3, or 4
			testVals.userOneStreak = -5;
			expect(submitGame(testState, testGame)["1"].streakPoints).to.equal(undefined);
			testVals.userOneStreak = 0;
			expect(submitGame(testState, testGame)["1"].streakPoints).to.equal(undefined);
			testVals.userOneStreak = 1;
			expect(submitGame(testState, testGame)["1"].streakPoints).to.equal(undefined);
			testVals.userOneStreak = 3;
			expect(submitGame(testState, testGame)["1"].streakPoints).to.equal(undefined);
		});

		it('increments the winner\'s powers only on supreme', () => {
			// no supreme
			const diff = submitGame(testState, testGame);
			expect(diff["1"].powers).to.equal(undefined); // no power change if no supreme
			expect(diff["2"].powers).to.equal(undefined); // no power change for the loser ever

			// supreme
			testVals.supremeTest = true;
			const diff2 = submitGame(testState, testGame);
			expect(diff2["1"].powers).to.equal(testVals.userOnePowers + 1);
			expect(diff2["2"].powers).to.equal(undefined); // no power change for the loser ever
		});

		it('returns fire character\'s id if winning character exactly on a 3 streak', () => {
			// character on a 0 streak
			const diff = submitGame(testState, testGame);
			expect(diff["1"].fire).to.equal(undefined);

			// supreme
			testVals.userOneXterOneStreak = 2;
			const diff2 = submitGame(testState, testGame);
			expect(diff2["1"].fire).to.equal('1');
		});
	});

});