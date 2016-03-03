import { expect } from 'chai';
import { testVals, testState, testUndoGame, resetTestState } from './helper';
import undoGame, {
	undoLoserStreak,
	undoWinnerStreak,
	undoFireStatus,
	undoStreakPoints
} from '../lib/core/undo-game';

describe.skip('undo-game logic', () => {

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

	describe('undoFireStatus', () => {
		it('returns undefined when character streak is not 3', () => {
			expect(undoFireStatus('1', 1)).to.equal(undefined);
			expect(undoFireStatus('1', 2)).to.equal(undefined);
			expect(undoFireStatus('1', 4)).to.equal(undefined);
		});
		it('returns the characterId string if character streak is exactly 3', () => {
			expect(undoFireStatus('1', 3)).to.equal('1');
			expect(undoFireStatus('5', 3)).to.equal('5');
		});
	});

	describe('undoStreakPoints', () => {
		it('returns undefined when player streak is anything other than 3 or >=5', () => {
			expect(undoStreakPoints(3, 1)).to.equal(undefined);
			expect(undoStreakPoints(3, 2)).to.equal(undefined);
			expect(undoStreakPoints(3, 4)).to.equal(undefined);
		});
		it('decrements streak points if streak is 3 or >= 5', () => {
			expect(undoStreakPoints(3, 3)).to.equal(2);
			expect(undoStreakPoints(3, 5)).to.equal(2);
			expect(undoStreakPoints(3, 50)).to.equal(2);
		});
	});

	describe('undoGame', () => {
		beforeEach((done) => {
			resetTestState();
			done();
		});

		it('decrements winning player\'s score based on the winning character\'s previous value', () => {
			// give the user some non-zero score
			testVals.userOneScore = 50;

			const diff = undoGame(testState, testUndoGame);

			// one less than the current value since it was decr'd after the win
			expect(diff["1"].score).to.equal(testVals.userOneScore - testUndoGame.winner.prevCharVal);
			expect(diff["2"].score).to.equal(undefined); // no change for the loser
		});

		it('resets the character values properly', () => {
			const diff = undoGame(testState, testUndoGame);

			expect(diff["1"].characters["1"].value).to.equal(testVals.userOneXterOneVal + 1);
			expect(diff["2"].characters["2"].value).to.equal(testVals.userTwoXterTwoVal - 1);
		});

		it('handles the edge case of the winning character value being 1 after the the last game', () => {

			testVals.userOneXterOneVal = 1;
			testVals.lastGameWasForOnePoint = true;

			const diff = undoGame(testState, testUndoGame);

			// winner score is one less than the current value like normal
			expect(diff["1"].score).to.equal(testVals.userOneScore - testUndoGame.winner.prevCharVal);

			expect(diff["1"].characters["1"].value).to.equal(undefined); // no change in character value for the winner
			expect(diff["2"].characters["2"].value).to.equal(testVals.userTwoXterTwoVal - 1);
		});


		it('handles undoing the winning player and character streaks properly', () => {

			testVals.userOneStreak = 5;
			testVals.userOneXterOneStreak = 5;
			testVals.userTwoStreak = -5;
			testVals.userTwoXterTwoStreak = -5;

			const diff = undoGame(testState, testUndoGame);
			expect(diff["1"].streak).to.equal(4);
			expect(diff["1"].characters["1"].streak).to.equal(4);

			expect(diff["2"].streak).to.equal(-4);
			expect(diff["2"].characters["2"].streak).to.equal(-4);
		});

		it('handles the ambigous streak case by resetting streaks to 0', () => {
			testVals.userOneStreak = 1;
			testVals.userOneXterOneStreak = 1;
			testVals.userTwoStreak = -1;
			testVals.userTwoXterTwoStreak = -1;

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
			testVals.supremeTest = true;
			const diff2 = undoGame(testState, testUndoGame);
			expect(diff2["1"].powers).to.equal(testVals.userOnePowers - 1);
			expect(diff2["2"].powers).to.equal(undefined); // no power change for the loser ever
		});

		it('return undoFire field with characterId if character went on fire in the game we\'re undoing', () => {
			const diff = undoGame(testState, testUndoGame);
			expect(diff["1"].undoFire).to.equal(undefined);

			testVals.userOneXterOneStreak = 3;
			const diff2 = undoGame(testState, testUndoGame);
			expect(diff2["1"].undoFire).to.equal('1');
		});

		it('does\'nt return streakPoints if streak is neither 3 nor >= 5', () => {
			const diff = undoGame(testState, testUndoGame);
			expect(diff["1"].streakPoints).to.equal(undefined);

			testVals.userOneStreak = 4;
			const diff2 = undoGame(testState, testUndoGame);
			expect(diff2["1"].streakPoints).to.equal(undefined);
		});
		it('decrements streakPoints if streak is 3 or >=5', () => {
			testVals.userOneStreak = 3;
			const diff = undoGame(testState, testUndoGame);
			expect(diff["1"].streakPoints).to.equal(2);

			testVals.userOneStreak = 5;
			const diff2 = undoGame(testState, testUndoGame);
			expect(diff2["1"].streakPoints).to.equal(2);

			testVals.userOneStreak = 999;
			const diff3 = undoGame(testState, testUndoGame);
			expect(diff3["1"].streakPoints).to.equal(2);
		});
	});
});
