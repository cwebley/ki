/*
{
	winner: {
		uuid: 1,
		characterUuid: 1,
		prevCharVal: 1 // this needs to come from an outside source, since state isn't sufficient to tell us this in some cases
	},
	loser: {
		uuid: 2,
		characterUuid: 2,
		prevCharVal = 2 // this needs to come from an outside source, since state isn't sufficient to tell us this in some cases
	},
 	supreme: true
};
*/
const COINS_FOR_SUPREME = 3;

export default function undoGame (state, prevGame) {
	const winnerUuid = prevGame.winner.uuid;
	const winningCharacterUuid = prevGame.winner.characterUuid;
	const loserUuid = prevGame.loser.uuid;
	const losingCharacterUuid = prevGame.loser.characterUuid;
	const winningCharPrevValue = prevGame.winner.prevCharVal;

	let diff = {
		users: {},
		// removing something like championUuid should go in here
		_remove: {}
	};

	diff._remove.championUuid = unEvaluateChampion(winnerUuid, state.goal, state.users[winnerUuid].score, state.users[loserUuid].score, winningCharPrevValue);

	diff.users[winnerUuid] = {
		score: state.users[winnerUuid].score - winningCharPrevValue,
		characters: {}
	};

	let winningCharDiff = {};
	if (state.users[winnerUuid].characters[winningCharacterUuid].value !== winningCharPrevValue) {
		winningCharDiff.value = winningCharPrevValue;
	}

	diff.users[winnerUuid].streak = undoWinnerStreak(state.users[winnerUuid].streak);
	winningCharDiff.streak = undoWinnerStreak(state.users[winnerUuid].characters[winningCharacterUuid].streak);

	// only include the specific character in the diff if something has changed
	if (Object.keys(winningCharDiff).length) {
		diff.users[winnerUuid].characters[winningCharacterUuid] = winningCharDiff
	}

	diff.users[loserUuid] = {
		characters: {
			[losingCharacterUuid]: {
				value: prevGame.loser.prevCharVal
			}
		}
	};

	diff.users[loserUuid].streak = undoLoserStreak(state.users[loserUuid].streak);
	diff.users[loserUuid].characters[losingCharacterUuid].streak = undoLoserStreak(state.users[loserUuid].characters[losingCharacterUuid].streak);

	// undo fire
	const undoFireUuid = undoFireStatus(winningCharacterUuid, state.users[winnerUuid].characters[winningCharacterUuid].streak);

	// iterate through each of winner's characters and incr fireWins for characters already on fire
	Object.keys(state.users[winnerUuid].characters).forEach(cUuid => {
		if (alreadyOnFire(state.users[winnerUuid].characters[cUuid].streak) && winningCharacterUuid !== cUuid) {
			// decr the fireWins for this character that is already on fire
				if (!diff.users[winnerUuid].characters[cUuid]) {
				diff.users[winnerUuid].characters[cUuid] = {};
			}
			diff.users[winnerUuid].characters[cUuid].fireWins = state.users[winnerUuid].characters[cUuid].fireWins - 1;
		}
		if (undoFireUuid && (cUuid !== undoFireUuid)) {
			// character went on fire, it's not this one, decr value for all other characters
			if (!diff.users[winnerUuid].characters[cUuid]) {
				diff.users[winnerUuid].characters[cUuid] = {};
			}
			diff.users[winnerUuid].characters[cUuid].value = state.users[winnerUuid].characters[cUuid].value - 1;
		}
	});

	// unfortunately there is not currently enough info to undoIceStatus

	const coinsDiff = undoCoins(state.users[winnerUuid].coins, state.users[winnerUuid].streak, prevGame.supreme);
	if (coinsDiff) {
		diff.users[winnerUuid].coins = coinsDiff;
	}

	return diff;
}

export function unEvaluateChampion (winnerUuid, goal, winnerScore, loserScore, prevValue) {
	if (winnerScore - prevValue < goal) {
		// champion wasn't crowned, nothing to undo
		return undefined;
	}
	if (winnerScore - prevValue < loserScore) {
		// champion wasn't crowned, nothing to undo
		return undefined;
	}
	return winnerUuid;
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


export function alreadyOnFire (streak) {
	if (streak >= 3) {
		return true;
	}
	return false;
}

export function undoFireStatus (characterId, currentStreak) {
	if (currentStreak !== 3) {
		return undefined;
	}
	return characterId;
}

export function undoCoins (currentCoins, currentStreak, supreme) {
	let newCoins = currentCoins;

	if (currentStreak === 3 || currentStreak >= 5) {
		newCoins--;
	}
	if (supreme) {
		newCoins -= COINS_FOR_SUPREME;
	}
	if (newCoins !== currentCoins) {
		return newCoins;
	}
	return undefined;
}
