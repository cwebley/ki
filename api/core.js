// {
// 	winner: {
// 		playerId: 1,
// 		characterId: 1
// 	},
// 	loser: {
// 		playerId: 2,
// 		characterId: 2
// 	},
//  supreme: true
// };

export function submitGame(state, gameResult) {
	const winnerId = gameResult.winner.playerId.toString();
	const winningCharacterId = gameResult.winner.characterId.toString();
	const loserId = gameResult.loser.playerId.toString();
	const losingCharacterId = gameResult.loser.characterId.toString();

	let diff = {
		[winnerId]: {
			score: state.users[winnerId].score + state.users[winnerId].characters[winningCharacterId].value,
			streak: updateWinningStreak(state.users[winnerId].streak),
			characters: {
				[winningCharacterId]: {
					streak: updateWinningStreak(state.users[winnerId].characters[winningCharacterId].streak)
				}
			}
		},
		[loserId]: {
			streak: updateLosingStreak(state.users[loserId].streak),
			characters: {
				[losingCharacterId]: {
					streak: updateLosingStreak(state.users[loserId].characters[losingCharacterId].streak),
					value: updateLoserValue(state.users[loserId].characters[losingCharacterId].value)
				}
			}
		}
	}

	const streakPointsDiff = updateStreakPoints(state.users[winnerId].streakPoints, state.users[winnerId].streak);
	if ( streakPointsDiff ) {
		diff[winnerId].streakPoints = streakPointsDiff;
	}

	const winCharValDiff = updateWinnerValue(state.users[winnerId].characters[winningCharacterId].value);
	if ( winCharValDiff ) {
		diff[winnerId].characters[winningCharacterId].value = winCharValDiff;
	}

	// add a power for supreme
	if ( gameResult.supreme ) {
		diff[winnerId].powers = state.users[winnerId].powers + 1;
	}
	// determine if winning character is on fire

	const fire = fireStatus(winningCharacterId, state.users[winnerId].characters[winningCharacterId].streak);
	if ( fire ) {
		diff[winnerId].fire = fire;
	}
	// determine if losing character WAS on fire
	const ice = iceStatus(losingCharacterId, state.users[loserId].characters[losingCharacterId].streak);
	if ( ice ) {
		diff[loserId].ice = ice;
	}

	return diff;
}

export function undoGame(state, prevGame) {
	const winnerId = prevGame.winner.playerId.toString();
	const winningCharacterId = prevGame.winner.characterId.toString();
	const loserId = prevGame.loser.playerId.toString();
	const losingCharacterId = prevGame.loser.characterId.toString();

	let diff = {};

	diff[winnerId] = {
		score: state.users[winnerId].score - prevGame.winner.prevCharVal,
		characters: {}
	};

	let winningCharDiff = {};
	if ( state.users[winnerId].characters[winningCharacterId].value !== prevGame.winner.prevCharVal ) {
		winningCharDiff.value = prevGame.winner.prevCharVal;
	}

	diff[winnerId].streak = undoWinnerStreak(state.users[winnerId].streak);
	winningCharDiff.streak = undoWinnerStreak(state.users[winnerId].characters[winningCharacterId].streak);

	// only include the specific character in the diff if something has changed
	if ( Object.keys(winningCharDiff).length ) {
		diff[winnerId].characters[winningCharacterId] = winningCharDiff
	}

	diff[loserId] = {
		characters: {
			[losingCharacterId]: {
				value: prevGame.loser.prevCharVal
			}
		}
	};
	
	diff[loserId].streak = undoLoserStreak(state.users[loserId].streak);
	diff[loserId].characters[losingCharacterId].streak = undoLoserStreak(state.users[loserId].characters[losingCharacterId].streak);

	// subtract a power for supreme
	if ( prevGame.supreme ) {
		diff[winnerId].powers = state.users[winnerId].powers - 1;
	}

	return diff;
}

// if winning character goes on fire after this game, return the characterId
export function fireStatus(characterId, previousStreak) {
	if ( previousStreak === 2 ) {
		return characterId;
	}
	return undefined;
}

// if losing was iced this game, return the characterId
export function iceStatus(characterId, previousStreak) {
	if ( previousStreak >= 3 ) {
		return characterId;
	}
	return undefined;
}

export function updateWinningStreak(previousStreak) {
	if ( previousStreak < 0 ) {
		return 1;
	}
	return previousStreak + 1;
}

export function updateLosingStreak(previousStreak) {
	if ( previousStreak > 0 ) {
		return -1;
	}
	return previousStreak - 1;
}

export function updateWinnerValue(previousValue) {
	if ( previousValue === 1 ) {
		return undefined;
	}
	return previousValue - 1;
}

export function updateLoserValue(previousValue) {
	return previousValue + 1;
}

export function updateStreakPoints(currentPoints, previousStreak) {
	if ( previousStreak === 2 || previousStreak >= 4 ) {
		return currentPoints + 1;
	}
	return undefined;
}

// without more information, we can only figure out the previous streaks for the winner if they are currently above 1
export function undoWinnerStreak(currentStreak) {
	if ( currentStreak > 1 ) {
		return currentStreak - 1;
	}
	return 0;
}

// without more information, we can only figure out the previous streaks for the loser if they are currently below -1
export function undoLoserStreak(currentStreak) {
	if ( currentStreak < -1 ) {
		return currentStreak + 1;
	}
	return 0;
}