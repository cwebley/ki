import { expect } from 'chai';
import { testVals, testState, testUndoGame, resetTestState } from './helper';
import undoGame, {
	undoLoserStreak,
	undoWinnerStreak,
	undoFireStatus,
	undoCoins
} from '../lib/core/undo-game';

describe('undo-game logic', () => {

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

	describe('undoCoins', () => {
		it('returns undefined when player streak is anything other than 3 or >=5 and game wasn\'t supreme', () => {
			expect(undoCoins(3, 1, false)).to.equal(undefined);
			expect(undoCoins(3, 2, false)).to.equal(undefined);
			expect(undoCoins(3, 4, false)).to.equal(undefined);
		});
		it('decrements streak points if streak is 3 or >= 5', () => {
			expect(undoCoins(3, 3, false)).to.equal(2);
			expect(undoCoins(3, 5, false)).to.equal(2);
			expect(undoCoins(3, 50, false)).to.equal(2);
		});
		it('decrements the winner\'s coins by 3 when prev game was a supreme', () => {
			expect(undoCoins(3, 1, true)).to.equal(0);
			expect(undoCoins(30, 2, true)).to.equal(27);
		});
		it('Handles combinations of supreme and streaks', () => {
			expect(undoCoins(4, 3, true)).to.equal(0);
			expect(undoCoins(30, 9, true)).to.equal(26);
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
			expect(diff.users["user1Uuid"].score).to.equal(testVals.userOneScore - testUndoGame.winner.value);
			expect(diff.users["user2Uuid"].score).to.equal(undefined); // no change for the loser
		});

		it('resets the character values properly', () => {
			const diff = undoGame(testState, testUndoGame);

			expect(diff.users["user1Uuid"].characters["xter1Uuid"].value).to.equal(testVals.userOneXterOneVal + 1);
			expect(diff.users["user2Uuid"].characters["xter2Uuid"].value).to.equal(testVals.userTwoXterTwoVal - 1);
		});

		it('handles the edge case of the winning character value being 1 after the the last game', () => {

			testVals.userOneXterOneVal = 1;
			testVals.lastGameWasForOnePoint = true;

			const diff = undoGame(testState, testUndoGame);

			// winner score is one less than the current value like normal
			expect(diff.users["user1Uuid"].score).to.equal(testVals.userOneScore - testUndoGame.winner.value);

			expect(diff.users["user1Uuid"].characters["xter1Uuid"].value).to.equal(undefined); // no change in character value for the winner
			expect(diff.users["user2Uuid"].characters["xter2Uuid"].value).to.equal(testVals.userTwoXterTwoVal - 1);
		});

		it('handles undoing the winning player and character streaks properly', () => {

			testVals.userOneStreak = 5;
			testVals.userOneXterOneStreak = 5;
			testVals.userTwoStreak = -5;
			testVals.userTwoXterTwoStreak = -5;

			const diff = undoGame(testState, testUndoGame);
			expect(diff.users["user1Uuid"].streak).to.equal(4);
			expect(diff.users["user1Uuid"].characters["xter1Uuid"].streak).to.equal(4);

			expect(diff.users["user2Uuid"].streak).to.equal(-4);
			expect(diff.users["user2Uuid"].characters["xter2Uuid"].streak).to.equal(-4);
		});

		it('always subtracts 1 point for losing character\'s value', () => {

			testVals.userTwoXterTwoVal = 7;
			const diff = undoGame(testState, testUndoGame);
			expect(diff.users['user2Uuid'].characters['xter2Uuid'].value).to.equal(6);

			testVals.userTwoXterTwoVal = 2;
			const diff2 = undoGame(testState, testUndoGame);
			expect(diff2.users['user2Uuid'].characters['xter2Uuid'].value).to.equal(1);
		});

		it('handles the ambigous streak case by resetting streaks to 0', () => {
			testVals.userOneStreak = 1;
			testVals.userOneXterOneStreak = 1;
			testVals.userTwoStreak = -1;
			testVals.userTwoXterTwoStreak = -1;

			const diff = undoGame(testState, testUndoGame);
			expect(diff.users["user1Uuid"].streak).to.equal(0);
			expect(diff.users["user1Uuid"].characters["xter1Uuid"].streak).to.equal(0);

			expect(diff.users["user2Uuid"].streak).to.equal(0);
			expect(diff.users["user2Uuid"].characters["xter2Uuid"].streak).to.equal(0);
		});

		it('returns array of all characters with decremented values if we\'re undoing a fire game', () => {
			const diff = undoGame(testState, testUndoGame);
			expect(diff.users["user1Uuid"].characters["xter2Uuid"]).to.equal(undefined);

			testVals.userOneXterOneStreak = 3;
			const diff2 = undoGame(testState, testUndoGame);
			expect(diff2.users["user1Uuid"].characters["xter2Uuid"].value).to.equal(testVals.userOneXterTwoVal - 1);
		});

		it('doesn\'t return streakPoints if streak is neither 3 nor >= 5', () => {
			const diff = undoGame(testState, testUndoGame);
			expect(diff.users["user1Uuid"].streakPoints).to.equal(undefined);

			testVals.userOneStreak = 4;
			const diff2 = undoGame(testState, testUndoGame);
			expect(diff2.users["user1Uuid"].streakPoints).to.equal(undefined);
		});
	});
});
