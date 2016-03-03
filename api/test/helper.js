// these values are set manually in tests, or all at once when resetTestState() is called
let testVals = {
	// state values
	userOneScore: undefined,
	userOneWins: undefined,
	userOneLosses: undefined,
	userOneStreak: undefined,
	userOneBestStreak: undefined,
	userOneCoins: undefined,
	userOneUpcoming: [],
	userOneGlobalStreak: undefined,
	userOneGlobalBestStreak: undefined,
	userOneTournamentStreak: undefined,
	userOneTournamentBestStreak: undefined,

	userOneXterOneVal: undefined,
	userOneXterOneWins: undefined,
	userOneXterOneLosses: undefined,
	userOneXterOneFireWins: undefined,
	userOneXterOneStreak: undefined,
	userOneXterOneBestStreak: undefined,
	userOneXterOneGlobalStreak: undefined,
	userOneXterOneGlobalBestStreak: undefined,

	userOneXterTwoVal: undefined,
	userOneXterTwoWins: undefined,
	userOneXterTwoLosses: undefined,
	userOneXterTwoFireWins: undefined,
	userOneXterTwoStreak: undefined,
	userOneXterTwoBestStreak: undefined,
	userOneXterTwoGlobalStreak: undefined,
	userOneXterTwoGlobalBestStreak: undefined,

	userTwoScore: undefined,
	userTwoWins: undefined,
	userTwoLosses: undefined,
	userTwoStreak: undefined,
	userTwoBestStreak: undefined,
	userTwoCoins: undefined,
	userTwoUpcoming: [],
	userTwoGlobalStreak: undefined,
	userTwoGlobalBestStreak: undefined,
	userTwoTournamentStreak: undefined,
	userTwoTournamentBestStreak: undefined,

	userTwoXterOneVal: undefined,
	userTwoXterOneWins: undefined,
	userTwoXterOneLosses: undefined,
	userTwoXterOneFireWins: undefined,
	userTwoXterOneStreak: undefined,
	userTwoXterOneBestStreak: undefined,
	userTwoXterOneGlobalStreak: undefined,
	userTwoXterOneGlobalBestStreak: undefined,

	userTwoXterTwoVal: undefined,
	userTwoXterTwoWins: undefined,
	userTwoXterTwoLosses: undefined,
	userTwoXterTwoFireWins: undefined,
	userTwoXterTwoStreak: undefined,
	userTwoXterTwoBestStreak: undefined,
	userTwoXterTwoGlobalStreak: undefined,
	userTwoXterTwoGlobalBestStreak: undefined,

	// other stuff for undo
	supremeTest: undefined,
	lastGameWasForOnePoint: undefined
}

function resetTestState () {
	testVals.userOneScore = 0;
	testVals.userOneWins = 0;
	testVals.userOneLosses = 0;
	testVals.userOneStreak = 0;
	testVals.userOneBestStreak = 0;
	testVals.userOneGlobalStreak = 0;
	testVals.userOneGlobalBestStreak = 0;
	testVals.userOneTournamentStreak = 0;
	testVals.userOneTournamentBestStreak = 0;
	testVals.userOneCoins = 10;
	testVals.userOneUpcoming = ['xter1Uuid', 'xter2Uuid'];

	testVals.userOneXterOneVal = 6;
	testVals.userOneXterOneWins = 0;
	testVals.userOneXterOneLosses = 0;
	testVals.userOneXterOneStreak = 0;
	testVals.userOneXterOneBestStreak = 0;
	testVals.userOneXterOneFireWins = 0;
	testVals.userOneXterOneGlobalStreak = 0;
	testVals.userOneXterOneGlobalBestStreak = 0;

	testVals.userOneXterTwoVal = 3;
	testVals.userOneXterTwoWins = 0;
	testVals.userOneXterTwoLosses = 0;
	testVals.userOneXterTwoStreak = 0;
	testVals.userOneXterTwoBestStreak = 0;
	testVals.userOneXterTwoFireWins = 0;
	testVals.userOneXterTwoGlobalStreak = 0;
	testVals.userOneXterTwoGlobalBestStreak = 0;

	testVals.userTwoScore = 0;
	testVals.userTwoWins = 0;
	testVals.userTwoLosses = 0;
	testVals.userTwoStreak = 0;
	testVals.userTwoBestStreak = 0;
	testVals.userTwoGlobalStreak = 0;
	testVals.userTwoGlobalBestStreak = 0;
	testVals.userTwoTournamentStreak = 0;
	testVals.userTwoTournamentBestStreak = 0;
	testVals.userTwoCoins = 10;
	testVals.userTwoUpcoming = ['xter1Uuid', 'xter2Uuid'];

	testVals.userTwoXterOneVal = 5;
	testVals.userTwoXterOneWins = 0;
	testVals.userTwoXterOneLosses = 0;
	testVals.userTwoXterOneStreak = 0;
	testVals.userTwoXterOneBestStreak = 0;
	testVals.userTwoXterOneFireWins = 0;
	testVals.userTwoXterOneGlobalStreak = 0;
	testVals.userTwoXterOneGlobalBestStreak = 0;

	testVals.userTwoXterTwoVal = 2;
	testVals.userTwoXterTwoWins = 0;
	testVals.userTwoXterTwoLosses = 0;
	testVals.userTwoXterTwoStreak = 0;
	testVals.userTwoXterTwoBestStreak = 0;
	testVals.userTwoXterTwoFireWins = 0;
	testVals.userTwoXterTwoGlobalStreak = 0;
	testVals.userTwoXterTwoGlobalBestStreak = 0;

	testVals.supremeTest = false;
	testVals.lastGameWasForOnePoint = false;
};


// getters allow each of these values to be customized succinctly in tests
// let testState = {
// 	users: {
// 		1: {
// 			get score() { return testVals.userOneScore },
// 			get streak() { return testVals.userOneStreak },
// 			get powers() { return testVals.userOnePowers },
// 			get streakPoints() { return testVals.userOneStreakPoints },
// 			characters: {
// 				1: {
// 					get value() { return testVals.userOneXterOneVal },
// 					get streak() { return testVals.userOneXterOneStreak }
// 				},
// 				2: {
// 					get value() { return testVals.userOneXterTwoVal },
// 					get streak() { return testVals.userOneXterTwoStreak }
// 				}
// 			}
// 		},
// 		2: {
// 			get score() { return testVals.userTwoScore },
// 			get streak() { return testVals.userTwoStreak },
// 			get powers() { return testVals.userTwoPowers },
// 			get streakPoints() { return testVals.userTwoStreakPoints },
// 			characters: {
// 				1: {
// 					get value() { return testVals.userTwoXterOneVal },
// 					get streak() { return testVals.userTwoXterOneStreak }
// 				},
// 				2: {
// 					get value() { return testVals.userTwoXterTwoVal },
// 					get streak() { return testVals.userTwoXterTwoStreak }
// 				}
// 			}
// 		}
// 	}
// };

let testState = {
	users: {
		'user1Uuid': {
			get score() { return testVals.userOneScore },
			get wins() { return testVals.userOneWins },
			get losses() { return testVals.userOneLosses },
			get streak() { return testVals.userOneStreak },
			get bestStreak() { return testVals.userOneBestStreak },
			get coins() { return testVals.userOneCoins },
			get globalStreak() { return testVals.userOneGlobalStreak },
			get globalBestStreak() { return testVals.userOneGlobalBestStreak },
			get upcoming() { return testVals.userOneUpcoming },
			get tournamentStreak() { return testVals.userOneTournamentStreak },
			get tournamentBestStreak() { return testVals.userOneTournamentBestStreak },

			characters: {
				'xter1Uuid': {
					get value() { return testVals.userOneXterOneVal },
					get streak() { return testVals.userOneXterOneStreak },
					get bestStreak() { return testVals.userOneXterOneBestStreak },
					get wins() { return testVals.userOneXterOneWins },
					get losses() { return testVals.userOneXterOneLosses },
					get fireWins() { return testVals.userOneXterOneFireWins },
					get globalStreak() { return testVals.userOneXterOneGlobalStreak },
					get globalBestStreak() { return testVals.userOneXterOneGlobalBestStreak },
				},
				'xter2Uuid': {
					get value() { return testVals.userOneXterTwoVal },
					get streak() { return testVals.userOneXterTwoStreak },
					get bestStreak() { return testVals.userOneXterTwoBestStreak },
					get wins() { return testVals.userOneXterTwoWins },
					get losses() { return testVals.userOneXterTwoLosses },
					get fireWins() { return testVals.userOneXterTwoFireWins },
					get globalStreak() { return testVals.userOneXterTwoGlobalStreak },
					get globalBestStreak() { return testVals.userOneXterTwoGlobalBestStreak },

				}
			}
		},
		'user2Uuid': {
			get score() { return testVals.userTwoScore },
			get wins() { return testVals.userTwoWins },
			get losses() { return testVals.userTwoLosses },
			get streak() { return testVals.userTwoStreak },
			get bestStreak() { return testVals.userTwoBestStreak },
			get coins() { return testVals.userTwoCoins },
			get globalStreak() { return testVals.userTwoGlobalStreak },
			get globalBestStreak() { return testVals.userTwoGlobalBestStreak },
			get upcoming() { return testVals.userTwoUpcoming },
			get tournamentStreak() { return testVals.userTwoTournamentStreak },
			get tournamentBestStreak() { return testVals.userTwoTournamentBestStreak },


			characters: {
				'xter1Uuid': {
					get value() { return testVals.userTwoXterOneVal },
					get streak() { return testVals.userTwoXterOneStreak },
					get bestStreak() { return testVals.userTwoXterOneBestStreak },
					get wins() { return testVals.userTwoXterOneWins },
					get losses() { return testVals.userTwoXterOneLosses },
					get fireWins() { return testVals.userTwoXterOneFireWins },
					get globalStreak() { return testVals.userTwoXterOneGlobalStreak },
					get globalBestStreak() { return testVals.userTwoXterOneGlobalBestStreak },


				},
				'xter2Uuid': {
					get value() { return testVals.userTwoXterTwoVal },
					get streak() { return testVals.userTwoXterTwoStreak },
					get bestStreak() { return testVals.userTwoXterTwoBestStreak },
					get wins() { return testVals.userTwoXterTwoWins },
					get losses() { return testVals.userTwoXterTwoLosses },
					get fireWins() { return testVals.userTwoXterTwoFireWins },
					get globalStreak() { return testVals.userTwoXterTwoGlobalStreak },
					get globalBestStreak() { return testVals.userTwoXterTwoGlobalBestStreak },
				}
			}
		}
	}
};

let testGame = {
	winner: {
		uuid: 'user1Uuid',
		characterUuid: 'xter1Uuid'
	},
	loser: {
		uuid: 'user2Uuid',
		characterUuid: 'xter2Uuid'
	},
	get supreme() { return testVals.supremeTest }
};

let testUndoGame = {
	winner: {
		playerId: 'user1Uuid',
		characterId: 'xter1Uuid',
		get prevCharVal() {
			if (testVals.lastGameWasForOnePoint) {
				return 1;
			}
			return testVals.userOneXterOneVal + 1
		}
	},
	loser: {
		playerId: 'user2Uuid',
		characterId: 'xter2Uuid',
		get prevCharVal() {
			if (testVals.userTwoXterTwoVal > 1) {
				return testVals.userTwoXterTwoVal - 1;
			}
			return testVals.userTwoXterTwoVal;
		}
	},
	get supreme() { return testVals.supremeTest }
};

export { testVals, testState, testGame, testUndoGame, resetTestState };
