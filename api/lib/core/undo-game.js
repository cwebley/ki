export default function undoGame (state, prevGame) {
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
	if (state.users[winnerId].characters[winningCharacterId].value !== prevGame.winner.prevCharVal) {
		winningCharDiff.value = prevGame.winner.prevCharVal;
	}

	diff[winnerId].streak = undoWinnerStreak(state.users[winnerId].streak);
	winningCharDiff.streak = undoWinnerStreak(state.users[winnerId].characters[winningCharacterId].streak);

	// only include the specific character in the diff if something has changed
	if (Object.keys(winningCharDiff).length) {
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
	if (prevGame.supreme) {
		diff[winnerId].powers = state.users[winnerId].powers - 1;
	}

	// undo fire
	const undoFire = undoFireStatus(winningCharacterId, state.users[winnerId].characters[winningCharacterId].streak);
	if (undoFire) {
		diff[winnerId].undoFire = undoFire;
	}
	// unfortunately there is not currently enough info to undoIceStatus

	const streakPointsDiff = undoStreakPoints(state.users[winnerId].streakPoints, state.users[winnerId].streak);
	if (streakPointsDiff) {
		diff[winnerId].streakPoints = streakPointsDiff;
	}

	return diff;
}

// without more information, we can only figure out the previous streaks for the winner if they are currently above 1
export function undoWinnerStreak (currentStreak) {
	if (currentStreak > 1) {
		return currentStreak - 1;
	}
	return 0;
}

// without more information, we can only figure out the previous streaks for the loser if they are currently below -1
export function undoLoserStreak (currentStreak) {
	if (currentStreak < -1) {
		return currentStreak + 1;
	}
	return 0;
}

export function undoFireStatus (characterId, currentStreak) {
	if (currentStreak !== 3) {
		return undefined;
	}
	return characterId;
}

export function undoStreakPoints (currentPoints, currentStreak) {
	if (currentStreak === 3 || currentStreak >= 5) {
		return currentPoints - 1;
	}
	return undefined;
}
