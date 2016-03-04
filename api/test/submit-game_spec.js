import { expect } from 'chai';
import get from 'lodash.get';
import { testVals, testState, testGame, resetTestState } from './helper';
import submitGame, {
	COINS_FOR_SUPREME,
	updateLoserValue,
	updateWinnerValue,
	updateWinningStreak,
	updateLosingStreak,
	updateBestStreak,
	fireStatus,
	alreadyOnFire,
	iceStatus,
	updateCoins
} from '../lib/core/submit-game';

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

	describe('updateBestStreak', () => {
		it('returns current streak if current streak is greater than best streak', () => {
			expect(updateBestStreak(1, 0)).to.equal(1);
			expect(updateBestStreak(5, 4)).to.equal(5);
		});
		it('returns undefined if current streak is less than best streak', () => {
			expect(updateBestStreak(0, 5)).to.equal(undefined);
			expect(updateBestStreak(10, 15)).to.equal(undefined);
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

	describe('updateCoins', () => {
		it('increments coins when new previousStreak is 2 or >= 4', () => {
			expect(updateCoins(0, 2)).to.equal(1);
			expect(updateCoins(1, 2)).to.equal(2);
			expect(updateCoins(1, 4)).to.equal(2);
			expect(updateCoins(1, 5)).to.equal(2);
			expect(updateCoins(999, 999)).to.equal(1000);
		});
		it('adds COINS_FOR_SUPREME for a supreme', () => {
			expect(updateCoins(0, 0, true)).to.equal(3);
		});
		it('handles combination of streak and supreme', () => {
			expect(updateCoins(0, 2, true)).to.equal(4);
			expect(updateCoins(10, 12, true)).to.equal(14);
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
			const charIdStr = 'user1Uuid';
			expect(fireStatus(charIdStr, 2)).to.equal(charIdStr);
		});
	});

	describe('alreadyOnFire', () => {
		it('returns true if character\'s streak is 3 or greater', () => {
			expect(alreadyOnFire(3)).to.equal(true);
			expect(alreadyOnFire(9)).to.equal(true);
			expect(alreadyOnFire(0)).to.equal(false);
			expect(alreadyOnFire(2)).to.equal(false);
		});
	});

	describe('iceStatus', () => {
		it('returns undefined when previous streak is less than 3', () => {
			expect(iceStatus('1', 0)).to.equal(undefined);
			expect(iceStatus('1', 1)).to.equal(undefined);
			expect(iceStatus('1', 2)).to.equal(undefined);
		});
		it('returns the characterId string when previous streak is greater than 3', () => {
			const charIdStr = 'user1Uuid';
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
			expect(diff.users['user1Uuid'].score).to.equal(testVals.userOneXterOneVal);
			expect(diff.users['user2Uuid'].score).to.equal(undefined); // no change for the loser

			// update the scores and run again to make sure it factors in the current score
			testVals.userOneScore = 10;
			const diff2 = submitGame(testState, testGame);
			expect(diff2.users['user1Uuid'].score).to.equal(testVals.userOneScore + testVals.userOneXterOneVal);
			expect(diff2.users['user2Uuid'].score).to.equal(undefined); // no change for the loser
		});

		it('handles character value changes', () => {
			const diff = submitGame(testState, testGame);

			expect(diff.users['user1Uuid'].characters['xter1Uuid'].value).to.equal(testVals.userOneXterOneVal - 1);
			expect(diff.users['user2Uuid'].characters['xter2Uuid'].value).to.equal(testVals.userTwoXterTwoVal + 1);
		});

		it('handles the edge case of the winning character already having a value of 1', () => {

			testVals.userOneXterOneVal = 1;
			const diff = submitGame(testState, testGame);

			expect(diff.users['user1Uuid'].characters['xter1Uuid'].value).to.equal(undefined); // no change in character value for the winner
			expect(diff.users['user2Uuid'].characters['xter2Uuid'].value).to.equal(testVals.userTwoXterTwoVal + 1);
		});

		it('handles player and character streaks properly', () => {

			const diff = submitGame(testState, testGame);
			expect(diff.users['user1Uuid'].streak).to.equal(1);
			expect(diff.users['user1Uuid'].characters['xter1Uuid'].streak).to.equal(1);
			expect(diff.users['user2Uuid'].streak).to.equal(-1);
			expect(diff.users['user2Uuid'].characters['xter2Uuid'].streak).to.equal(-1);

			// ensure it can incr/decr properly
			testVals.userOneStreak = 1;
			testVals.userOneXterOneStreak = 1;
			testVals.userTwoStreak = -1;
			testVals.userTwoXterTwoStreak = -1;

			const diff2 = submitGame(testState, testGame);
			expect(diff2.users['user1Uuid'].streak).to.equal(2);
			expect(diff2.users['user1Uuid'].characters['xter1Uuid'].streak).to.equal(2);
			expect(diff2.users['user2Uuid'].streak).to.equal(-2);
			expect(diff2.users['user2Uuid'].characters['xter2Uuid'].streak).to.equal(-2);

			// ensure it resets negative streaks to positive and vice versa
			testVals.userOneStreak = -5;
			testVals.userOneXterOneStreak = -5;
			testVals.userTwoStreak = 5;
			testVals.userTwoXterTwoStreak = 5;

			const diff3 = submitGame(testState, testGame);
			expect(diff3.users['user1Uuid'].streak).to.equal(1);
			expect(diff3.users['user1Uuid'].characters['xter1Uuid'].streak).to.equal(1);
			expect(diff3.users['user2Uuid'].streak).to.equal(-1);
			expect(diff3.users['user2Uuid'].characters['xter2Uuid'].streak).to.equal(-1);

		});

		it('updates coins for the winner only when previousStreak is 2 or >= 4 streaks', () => {

			testVals.userOneStreak = 2;
			const diff = submitGame(testState, testGame);

			expect(diff.users['user1Uuid'].coins).to.equal(testVals.userOneCoins + 1);
			expect(diff.users['user2Uuid'].coins).to.equal(undefined);

			testVals.userOneStreak = 4;
			expect(submitGame(testState, testGame).users['user1Uuid'].coins).to.equal(testVals.userOneCoins + 1);
			testVals.userOneStreak = 999;
			expect(submitGame(testState, testGame).users['user1Uuid'].coins).to.equal(testVals.userOneCoins + 1);

			// no update if current streak after this game is less than 3, or 4
			testVals.userOneStreak = -5;
			expect(submitGame(testState, testGame).users['user1Uuid'].coins).to.equal(undefined);
			testVals.userOneStreak = 0;
			expect(submitGame(testState, testGame).users['user1Uuid'].coins).to.equal(undefined);
			testVals.userOneStreak = 1;
			expect(submitGame(testState, testGame).users['user1Uuid'].coins).to.equal(undefined);
			testVals.userOneStreak = 3;
			expect(submitGame(testState, testGame).users['user1Uuid'].coins).to.equal(undefined);
		});

		it('increments the winner\'s coins on supreme', () => {
			// no supreme
			const diff = submitGame(testState, testGame);
			expect(diff.users['user1Uuid'].coins).to.equal(undefined); // no power change if no supreme
			expect(diff.users['user2Uuid'].coins).to.equal(undefined); // no power change for the loser ever

			// supreme
			testVals.supremeTest = true;
			const diff2 = submitGame(testState, testGame);
			expect(diff2.users['user1Uuid'].coins).to.equal(testVals.userOneCoins + COINS_FOR_SUPREME);
			expect(diff2.users['user2Uuid'].coins).to.equal(undefined); // no power change for the loser ever
		});

		it('returns winner\'s characters with incremented values if some character just went on fire', () => {
			// character on a 0 streak
			const diff = submitGame(testState, testGame);
			expect(get(diff.users['user1Uuid'].characters, 'xter2Uuid.value')).to.equal(undefined);

			testVals.userOneXterOneStreak = 2;
			testVals.userOneXterTwoVal = 3;
			const diff2 = submitGame(testState, testGame);

			// xter1 won the game and went on fire, so xter2 goes up in value
			expect(get(diff2.users['user1Uuid'].characters, 'xter2Uuid.value')).to.equal(testVals.userOneXterTwoVal + 1);
		});

		it('returns loser\'s characters with decremented values if some character was just iced', () => {
			// character on a 0 streak
			const diff = submitGame(testState, testGame);
			expect(get(diff.users['user2Uuid'].characters, 'xter1Uuid.value')).to.equal(undefined);

			// xter 2 was on fire and he will lose this game
			testVals.userTwoXterTwoStreak = 3;
			testVals.userTwoXterOneVal = 9;
			const diff2 = submitGame(testState, testGame);
			console.log("DIFF2: ", JSON.stringify(diff2, null, 4))

			// xter2 lost and got iced, so xter1 goes down in value
			expect(get(diff2.users['user2Uuid'].characters, 'xter1Uuid.value')).to.equal(testVals.userTwoXterOneVal - 1);
		});

		it('returns winner\'s characters with incr\'d fireWins if characters were previously on fire', () => {
			// character on a 0 streak
			const diff = submitGame(testState, testGame);
			expect(get(diff.users['user1Uuid'].characters, 'xter2Uuid.fireWins')).to.equal(undefined);

			// xter2 already on fire, xter 1 will win this game
			testVals.userOneXterTwoStreak = 3;
			const diff2 = submitGame(testState, testGame);

			// xter1 won the game and went on fire, so xter2 goes up in value
			expect(get(diff2.users['user1Uuid'].characters, 'xter2Uuid.fireWins')).to.equal(testVals.userOneXterTwoFireWins + 1);
		});
	});
});
