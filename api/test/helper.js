// these values are set manually in tests, or all at once when resetTestState() is called
let testVals = {
	// state values
	goal: undefined,
	championUuid: undefined,

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
	userOneXterOneRawVal: undefined,
	userOneXterOneWins: undefined,
	userOneXterOneLosses: undefined,
	userOneXterOneFireWins: undefined,
	userOneXterOneStreak: undefined,
	userOneXterOneBestStreak: undefined,
	userOneXterOneGlobalStreak: undefined,
	userOneXterOneGlobalBestStreak: undefined,

	userOneXterTwoVal: undefined,
	userOneXterTwoRawVal: undefined,
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
	userTwoXterOneRawVal: undefined,
	userTwoXterOneWins: undefined,
	userTwoXterOneLosses: undefined,
	userTwoXterOneFireWins: undefined,
	userTwoXterOneStreak: undefined,
	userTwoXterOneBestStreak: undefined,
	userTwoXterOneGlobalStreak: undefined,
	userTwoXterOneGlobalBestStreak: undefined,

	userTwoXterTwoVal: undefined,
	userTwoXterTwoRawVal: undefined,
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
};

function resetTestState () {
	testVals.goal = 100;

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
	testVals.userOneUpcoming = [
		{
			uuid: 'someMatchupUuid',
			characterUuid: 'xter1Uuid'
		},
		{
			uuid: 'someMatchupUuid2',
			characterUuid: 'xter2Uuid'
		}
	];
	testVals.userOnePrevious = {
		uuid: 'somePreviousMatchupUuid',
		characterUuid: 'xter1Uuid'
	};

	testVals.userOneXterOneVal = 6;
	testVals.userOneXterRawVal = 6;
	testVals.userOneXterOneWins = 0;
	testVals.userOneXterOneLosses = 0;
	testVals.userOneXterOneStreak = 0;
	testVals.userOneXterOneBestStreak = 0;
	testVals.userOneXterOneFireWins = 0;
	testVals.userOneXterOneGlobalStreak = 0;
	testVals.userOneXterOneGlobalBestStreak = 0;

	testVals.userOneXterTwoVal = 3;
	testVals.userOneXterTwoRawVal = 3;
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
	testVals.userTwoUpcoming = [
		{
			uuid: 'someMatchupUuid3',
			characterUuid: 'xter1Uuid'
		},
		{
			uuid: 'someMatchupUuid4',
			characterUuid: 'xter2Uuid'
		}
	];
	testVals.userTwoPrevious = {
		uuid: 'somePreviousMatchupUuid2',
		characterUuid: 'xter2Uuid'
	};

	testVals.userTwoXterOneVal = 5;
	testVals.userTwoXterOneRawVal = 5;
	testVals.userTwoXterOneWins = 0;
	testVals.userTwoXterOneLosses = 0;
	testVals.userTwoXterOneStreak = 0;
	testVals.userTwoXterOneBestStreak = 0;
	testVals.userTwoXterOneFireWins = 0;
	testVals.userTwoXterOneGlobalStreak = 0;
	testVals.userTwoXterOneGlobalBestStreak = 0;

	testVals.userTwoXterTwoVal = 2;
	testVals.userTwoXterRawVal = 2;
	testVals.userTwoXterTwoWins = 0;
	testVals.userTwoXterTwoLosses = 0;
	testVals.userTwoXterTwoStreak = 0;
	testVals.userTwoXterTwoBestStreak = 0;
	testVals.userTwoXterTwoFireWins = 0;
	testVals.userTwoXterTwoGlobalStreak = 0;
	testVals.userTwoXterTwoGlobalBestStreak = 0;

	testVals.supremeTest = false;
	testVals.lastGameWasForOnePoint = false;
}

let testState = {
	get goal () { return testVals.goal; },
	get championUuid () { return testVals.championUuid; },
	users: {
		ids: {
			'user1Uuid': {
				get score () { return testVals.userOneScore; },
				get wins () { return testVals.userOneWins; },
				get losses () { return testVals.userOneLosses; },
				get streak () { return testVals.userOneStreak; },
				get bestStreak () { return testVals.userOneBestStreak; },
				get coins () { return testVals.userOneCoins; },
				get globalStreak () { return testVals.userOneGlobalStreak; },
				get globalBestStreak () { return testVals.userOneGlobalBestStreak; },
				get upcoming () { return testVals.userOneUpcoming; },
				get tournamentStreak () { return testVals.userOneTournamentStreak; },
				get tournamentBestStreak () { return testVals.userOneTournamentBestStreak; },
				get previous () { return testVals.userOnePrevious; },

				characters: {
					ids: {
						'xter1Uuid': {
							get value () { return testVals.userOneXterOneVal; },
							get rawValue () { return testVals.userOneXterOneRawVal; },
							get streak () { return testVals.userOneXterOneStreak; },
							get bestStreak () { return testVals.userOneXterOneBestStreak; },
							get wins () { return testVals.userOneXterOneWins; },
							get losses () { return testVals.userOneXterOneLosses; },
							get fireWins () { return testVals.userOneXterOneFireWins; },
							get globalStreak () { return testVals.userOneXterOneGlobalStreak; },
							get globalBestStreak () { return testVals.userOneXterOneGlobalBestStreak; }
						},
						'xter2Uuid': {
							get value () { return testVals.userOneXterTwoVal; },
							get rawValue () { return testVals.userOneXterTwoRawVal; },
							get streak () { return testVals.userOneXterTwoStreak; },
							get bestStreak () { return testVals.userOneXterTwoBestStreak; },
							get wins () { return testVals.userOneXterTwoWins; },
							get losses () { return testVals.userOneXterTwoLosses; },
							get fireWins () { return testVals.userOneXterTwoFireWins; },
							get globalStreak () { return testVals.userOneXterTwoGlobalStreak; },
							get globalBestStreak () { return testVals.userOneXterTwoGlobalBestStreak; }

						}
					},
					result: ['xter1Uuid', 'xter2Uuid']
				}
			},
			'user2Uuid': {
				get score () { return testVals.userTwoScore; },
				get wins () { return testVals.userTwoWins; },
				get losses () { return testVals.userTwoLosses; },
				get streak () { return testVals.userTwoStreak; },
				get bestStreak () { return testVals.userTwoBestStreak; },
				get coins () { return testVals.userTwoCoins; },
				get globalStreak () { return testVals.userTwoGlobalStreak; },
				get globalBestStreak () { return testVals.userTwoGlobalBestStreak; },
				get upcoming () { return testVals.userTwoUpcoming; },
				get tournamentStreak () { return testVals.userTwoTournamentStreak; },
				get tournamentBestStreak () { return testVals.userTwoTournamentBestStreak; },
				get previous () { return testVals.userTwoPrevious; },

				characters: {
					ids: {
						'xter1Uuid': {
							get value () { return testVals.userTwoXterOneVal; },
							get rawValue () { return testVals.userTwoXterOneRawVal; },
							get streak () { return testVals.userTwoXterOneStreak; },
							get bestStreak () { return testVals.userTwoXterOneBestStreak; },
							get wins () { return testVals.userTwoXterOneWins; },
							get losses () { return testVals.userTwoXterOneLosses; },
							get fireWins () { return testVals.userTwoXterOneFireWins; },
							get globalStreak () { return testVals.userTwoXterOneGlobalStreak; },
							get globalBestStreak () { return testVals.userTwoXterOneGlobalBestStreak; }


						},
						'xter2Uuid': {
							get value () { return testVals.userTwoXterTwoVal; },
							get rawValue () { return testVals.userTwoXterTwoRawVal; },
							get streak () { return testVals.userTwoXterTwoStreak; },
							get bestStreak () { return testVals.userTwoXterTwoBestStreak; },
							get wins () { return testVals.userTwoXterTwoWins; },
							get losses () { return testVals.userTwoXterTwoLosses; },
							get fireWins () { return testVals.userTwoXterTwoFireWins; },
							get globalStreak () { return testVals.userTwoXterTwoGlobalStreak; },
							get globalBestStreak () { return testVals.userTwoXterTwoGlobalBestStreak; }
						}
					},
					result: ['xter1Uuid', 'xter2Uuid']
				}
			}
		},
		result: ['user1Uuid', 'user2Uuid']
	},
	inspect: {
		// TODO make this configurable for testing
		available: true
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
	get supreme () { return testVals.supremeTest; }
};

let testUndoGame = {
	winner: {
		uuid: 'user1Uuid',
		characterUuid: 'xter1Uuid',
		get streak () { return testVals.userOneStreak - 1; },
		get characterStreak () { return testVals.userOneXterOneStreak - 1; },
		get value () {
			if (testVals.lastGameWasForOnePoint) {
				return 1;
			}
			return testVals.userOneXterOneVal + 1;
		}
	},
	loser: {
		uuid: 'user2Uuid',
		characterUuid: 'xter2Uuid',
		get streak () { return testVals.userTwoStreak + 1; },
		get characterStreak () { return testVals.userTwoXterTwoStreak + 1; },
		get value () {
			if (testVals.userTwoXterTwoVal > 1) {
				return testVals.userTwoXterTwoVal - 1;
			}
			return testVals.userTwoXterTwoVal;
		}
	},
	get supreme () { return testVals.supremeTest; }
};

export { testVals, testState, testGame, testUndoGame, resetTestState };
