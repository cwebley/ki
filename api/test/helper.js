// these values are set manually in tests, or all at once when resetTestState() is called
let testVals = {
	userOneScore: undefined,
	userOneStreak: undefined,
	userOnePowers: undefined,
	userOneStreakPoints: undefined,
	userOneXterOneVal: undefined,
	userOneXterOneStreak: undefined,
	userOneXterTwoVal: undefined,
	userOneXterTwoStreak: undefined,

	userTwoScore: undefined,
	userTwoStreak: undefined,
	userTwoPowers: undefined,
	userTwoStreakPoints: undefined,
	userTwoXterOneVal: undefined,
	userTwoXterOneStreak: undefined,
	userTwoXterTwoVal: undefined,
	userTwoXterTwoStreak: undefined,

	supremeTest: undefined,
	lastGameWasForOnePoint: undefined
}

// getters allow each of these values to be customized succinctly in tests
let testState = {
	users: {
		1: {
			get score() { return testVals.userOneScore },
			get streak() { return testVals.userOneStreak },
			get powers() { return testVals.userOnePowers },
			get streakPoints() { return testVals.userOneStreakPoints },
			characters: {
				1: {
					get value() { return testVals.userOneXterOneVal },
					get streak() { return testVals.userOneXterOneStreak }
				},
				2: {
					get value() { return testVals.userOneXterTwoVal },
					get streak() { return testVals.userOneXterTwoStreak }
				}
			}
		},
		2: {
			get score() { return testVals.userTwoScore },
			get streak() { return testVals.userTwoStreak },
			get powers() { return testVals.userTwoPowers },
			get streakPoints() { return testVals.userTwoStreakPoints },
			characters: {
				1: {
					get value() { return testVals.userTwoXterOneVal },
					get streak() { return testVals.userTwoXterOneStreak }
				},
				2: {
					get value() { return testVals.userTwoXterTwoVal },
					get streak() { return testVals.userTwoXterTwoStreak }
				}
			}
		}
	}
};

let testGame = {
	winner: {
		playerId: 1,
		characterId: 1
	},
	loser: {
		playerId: 2,
		characterId: 2
	},
	get supreme() { return testVals.supremeTest }
};

let testUndoGame = {
	winner: {
		playerId: 1,
		characterId: 1,
		get prevCharVal() {
			if ( testVals.lastGameWasForOnePoint ) {
				return 1;
			}
			return testVals.userOneXterOneVal + 1
		}
	},
	loser: {
		playerId: 2,
		characterId: 2,
		get prevCharVal() {
			if ( testVals.userTwoXterTwoVal > 1 ) {
				return testVals.userTwoXterTwoVal - 1;
			}
			return testVals.userTwoXterTwoVal;
		}
	},
	get supreme() { return testVals.supremeTest }
};

function resetTestState() {
	testVals.userOneScore = 0;
	testVals.userOneStreak = 0;
	testVals.userOnePowers = 3;
	testVals.userOneStreakPoints = 3;
	testVals.userOneXterOneVal = 6;
	testVals.userOneXterOneStreak = 0;
	testVals.userOneXterTwoVal = 3;
	testVals.userOneXterTwoStreak = 0;

	testVals.userTwoScore = 0;
	testVals.userTwoStreak = 0;
	testVals.userTwoPowers = 3;
	testVals.userTwoStreakPoints = 2;
	testVals.userTwoXterOneVal = 5;
	testVals.userTwoXterOneStreak = 0;
	testVals.userTwoXterTwoVal = 2;
	testVals.userTwoXterTwoStreak = 0;

	testVals.supremeTest = false;
	testVals.lastGameWasForOnePoint = false;
};

export { testVals, testState, testGame, testUndoGame, resetTestState };
