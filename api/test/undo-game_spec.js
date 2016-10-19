/* global describe it beforeEach */
import { expect } from 'chai';
import config from '../config';
import { testVals, testState, testUndoGame, resetTestState } from './helper';
import undoGame, {
	undoFireStatus,
	undoIceStatus,
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

	describe('undoIceStatus', () => {
		it('returns undefined when character streak is less than 2', () => {
			expect(undoIceStatus('1', 1)).to.equal(undefined);
			expect(undoIceStatus('1', 2)).to.equal(undefined);
			expect(undoIceStatus('1', 0)).to.equal(undefined);
		});
		it('returns the characterId string if character streak is greater than 2', () => {
			expect(undoIceStatus('1', 3)).to.equal('1');
			expect(undoIceStatus('5', 4)).to.equal('5');
		});
	});

	describe('undoCoins', () => {
		it('returns undefined when player streak is not >= 3 and game wasn\'t supreme', () => {
			expect(undoCoins(3, 1, false)).to.equal(undefined);
			expect(undoCoins(3, 2, false)).to.equal(undefined);
			expect(undoCoins(3, 0, false)).to.equal(undefined);
		});
		it('decrements coins if streak is >= 3', () => {
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
			expect(diff.users.ids['user1Uuid'].score).to.equal(testVals.userOneScore - testUndoGame.winner.value);
			expect(diff.users.ids['user2Uuid'].score).to.equal(undefined); // no change for the loser
		});

		it('resets the character values properly', () => {
			const diff = undoGame(testState, testUndoGame);

			expect(diff.users.ids['user1Uuid'].characters.ids['xter1Uuid'].value).to.equal(testVals.userOneXterOneVal + 1);
			expect(diff.users.ids['user2Uuid'].characters.ids['xter2Uuid'].value).to.equal(testVals.userTwoXterTwoVal - 1);
		});

		it('handles the edge case of the winning character value being 1 after the the last game', () => {
			testVals.userOneXterOneVal = 1;
			testVals.lastGameWasForOnePoint = true;

			const diff = undoGame(testState, testUndoGame);

			// winner score is one less than the current value like normal
			expect(diff.users.ids['user1Uuid'].score).to.equal(testVals.userOneScore - testUndoGame.winner.value);

			expect(diff.users.ids['user1Uuid'].characters.ids['xter1Uuid'].value).to.equal(undefined); // no change in character value for the winner
			expect(diff.users.ids['user2Uuid'].characters.ids['xter2Uuid'].value).to.equal(testVals.userTwoXterTwoVal - 1);
		});

		it('handles undoing the winning player and character streaks properly', () => {
			testVals.userOneStreak = 5;
			testVals.userOneXterOneStreak = 5;
			testVals.userTwoStreak = -5;
			testVals.userTwoXterTwoStreak = -5;

			const diff = undoGame(testState, testUndoGame);
			expect(diff.users.ids['user1Uuid'].streak).to.equal(4);
			expect(diff.users.ids['user1Uuid'].characters.ids['xter1Uuid'].streak).to.equal(4);

			expect(diff.users.ids['user2Uuid'].streak).to.equal(-4);
			expect(diff.users.ids['user2Uuid'].characters.ids['xter2Uuid'].streak).to.equal(-4);
		});

		it('always subtracts 1 point for losing character\'s value', () => {
			testVals.userTwoXterTwoVal = 7;
			const diff = undoGame(testState, testUndoGame);
			expect(diff.users.ids['user2Uuid'].characters.ids['xter2Uuid'].value).to.equal(6);

			testVals.userTwoXterTwoVal = 2;
			const diff2 = undoGame(testState, testUndoGame);
			expect(diff2.users.ids['user2Uuid'].characters.ids['xter2Uuid'].value).to.equal(1);
		});

		it('decrements wins and losses for users', () => {
			testVals.userOneWins = 3;
			testVals.userOneLosses = 3;
			testVals.userTwoWins = 3;
			testVals.userTwoLosses = 3;

			const diff = undoGame(testState, testUndoGame);
			expect(diff.users.ids['user1Uuid'].wins).to.equal(testVals.userOneWins - 1);
			expect(diff.users.ids['user2Uuid'].losses).to.equal(testVals.userTwoLosses - 1);
		});

		it('returns all characters with decremented values if we\'re undoing a fire game', () => {
			const diff = undoGame(testState, testUndoGame);
			expect(diff.users.ids['user1Uuid'].characters.ids['xter2Uuid']).to.equal(undefined);

			testVals.userOneXterOneStreak = 3;
			const diff2 = undoGame(testState, testUndoGame);
			expect(diff2.users.ids['user1Uuid'].characters.ids['xter2Uuid'].value).to.equal(testVals.userOneXterTwoVal - 1);
		});

		it('returns all characters with incremented values if we\'re undoing an ice game', () => {
			const diff = undoGame(testState, testUndoGame);
			expect(diff.users.ids['user2Uuid'].characters.ids['xter1Uuid']).to.equal(undefined);

			// 2 streak after the undo, will be submitted as a 3 streak via the getter in testUndoGame
			testVals.userTwoXterTwoStreak = 2;
			const diff2 = undoGame(testState, testUndoGame);
			expect(diff2.users.ids['user2Uuid'].characters.ids['xter1Uuid'].value).to.equal(testVals.userTwoXterOneVal + 1);
		});

		it('doesn\'t return streakPoints if streak is not >= 3', () => {
			const diff = undoGame(testState, testUndoGame);
			expect(diff.users.ids['user1Uuid'].coins).to.equal(undefined);

			testVals.userOneStreak = 2;
			const diff2 = undoGame(testState, testUndoGame);
			expect(diff2.users.ids['user1Uuid'].coins).to.equal(undefined);
		});

		it('returns upcoming with the previous matchup showing up in the first slot', () => {
			const diff = undoGame(testState, testUndoGame);
			expect(diff.users.ids['user1Uuid'].upcoming && diff.users.ids['user1Uuid'].upcoming[0] && diff.users.ids['user1Uuid'].upcoming[0].characterUuid).to.equal('xter1Uuid');
			expect(diff.users.ids['user2Uuid'].upcoming && diff.users.ids['user2Uuid'].upcoming[0] && diff.users.ids['user2Uuid'].upcoming[0].characterUuid).to.equal('xter2Uuid');
		});
	});

	describe('undoGame with rematch = true', () => {
		beforeEach((done) => {
			resetTestState();
			done();
		});

		it('decrements winning player\'s score based on the winning character\'s previous value', () => {
			// give the user some non-zero score
			testVals.userOneScore = 50;

			const diff = undoGame(testState, testUndoGame, 'user1Uuid');
			expect(diff.users.ids['user1Uuid'].score).to.equal(testVals.userOneScore - testUndoGame.winner.value);
			expect(diff.users.ids['user2Uuid'].score).to.equal(undefined); // no change for the loser
		});

		it('resets the character values properly', () => {
			const diff = undoGame(testState, testUndoGame, 'user1Uuid');

			expect(diff.users.ids['user1Uuid'].characters.ids['xter1Uuid'].value).to.equal(testVals.userOneXterOneVal + 1);
			expect(diff.users.ids['user2Uuid'].characters.ids['xter2Uuid'].value).to.equal(testVals.userTwoXterTwoVal - 1);
		});

		it('handles the edge case of the winning character value being 1 after the the last game', () => {
			testVals.userOneXterOneVal = 1;
			testVals.lastGameWasForOnePoint = true;

			const diff = undoGame(testState, testUndoGame, 'user1Uuid');

			// winner score is one less than the current value like normal
			expect(diff.users.ids['user1Uuid'].score).to.equal(testVals.userOneScore - testUndoGame.winner.value);

			expect(diff.users.ids['user1Uuid'].characters.ids['xter1Uuid'].value).to.equal(undefined); // no change in character value for the winner
			expect(diff.users.ids['user2Uuid'].characters.ids['xter2Uuid'].value).to.equal(testVals.userTwoXterTwoVal - 1);
		});

		it('handles undoing the winning player and character streaks properly', () => {
			testVals.userOneStreak = 5;
			testVals.userOneXterOneStreak = 5;
			testVals.userTwoStreak = -5;
			testVals.userTwoXterTwoStreak = -5;

			const diff = undoGame(testState, testUndoGame, 'user1Uuid');
			expect(diff.users.ids['user1Uuid'].streak).to.equal(4);
			expect(diff.users.ids['user1Uuid'].characters.ids['xter1Uuid'].streak).to.equal(4);

			expect(diff.users.ids['user2Uuid'].streak).to.equal(-4);
			expect(diff.users.ids['user2Uuid'].characters.ids['xter2Uuid'].streak).to.equal(-4);
		});

		it('always subtracts 1 point for losing character\'s value', () => {
			testVals.userTwoXterTwoVal = 7;
			const diff = undoGame(testState, testUndoGame, 'user1Uuid');
			expect(diff.users.ids['user2Uuid'].characters.ids['xter2Uuid'].value).to.equal(6);

			testVals.userTwoXterTwoVal = 2;
			const diff2 = undoGame(testState, testUndoGame, 'user1Uuid');
			expect(diff2.users.ids['user2Uuid'].characters.ids['xter2Uuid'].value).to.equal(1);
		});

		it('doesn\'t change wins and losses for users', () => {
			testVals.userOneWins = 3;
			testVals.userOneLosses = 3;
			testVals.userTwoWins = 3;
			testVals.userTwoLosses = 3;

			const diff = undoGame(testState, testUndoGame, 'user1Uuid');
			expect(diff.users.ids['user1Uuid'].wins).to.equal(undefined);
			expect(diff.users.ids['user2Uuid'].losses).to.equal(undefined);
		});

		it('doesn\'t change wins and losses for characters', () => {
			testVals.userOneXterOneWins = 3;
			testVals.userOneXterTwoWins = 3;
			testVals.userTwoXterOneWins = 3;
			testVals.userTwoXterTwoWins = 3;

			const diff = undoGame(testState, testUndoGame, 'user1Uuid');
			expect(diff.users.ids['user1Uuid'].characters.ids['xter1Uuid'].wins).to.equal(undefined);
			expect(diff.users.ids['user2Uuid'].characters.ids['xter2Uuid'].losses).to.equal(undefined);
		});

		it('returns all characters with decremented values if we\'re undoing a fire game', () => {
			const diff = undoGame(testState, testUndoGame, 'user1Uuid');
			expect(diff.users.ids['user1Uuid'].characters.ids['xter2Uuid']).to.equal(undefined);

			testVals.userOneXterOneStreak = 3;
			const diff2 = undoGame(testState, testUndoGame, 'user1Uuid');
			expect(diff2.users.ids['user1Uuid'].characters.ids['xter2Uuid'].value).to.equal(testVals.userOneXterTwoVal - 1);
		});

		it('returns all characters with incremented values if we\'re undoing an ice game', () => {
			const diff = undoGame(testState, testUndoGame, 'user1Uuid');
			expect(diff.users.ids['user2Uuid'].characters.ids['xter1Uuid']).to.equal(undefined);

			// 2 streak after the undo, will be submitted as a 3 streak via the getter in testUndoGame
			testVals.userTwoXterTwoStreak = 2;
			const diff2 = undoGame(testState, testUndoGame, 'user1Uuid');
			expect(diff2.users.ids['user2Uuid'].characters.ids['xter1Uuid'].value).to.equal(testVals.userTwoXterOneVal + 1);
		});

		it('subtracts coins properly if user is not on a >= 3 streak', () => {
			const diff = undoGame(testState, testUndoGame, 'user1Uuid');
			expect(diff.users.ids['user1Uuid'].coins).to.equal(testVals.userOneCoins - config.cost.rematch);

			testVals.userOneStreak = 2;
			const diff2 = undoGame(testState, testUndoGame, 'user1Uuid');
			expect(diff2.users.ids['user1Uuid'].coins).to.equal(testVals.userOneCoins - config.cost.rematch);
		});
	});
});
