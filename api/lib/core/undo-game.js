/*
	{
		winner: {
			uuid: 1,
			characterUuid: 1,
			// these need to come from an outside source, since state isn't sufficient to tell us this in some cases
			value: 1,
			streak: 3,
			characterStreak: 3
		},
		loser: {
			uuid: 2,
			characterUuid: 2,
		},
	 	supreme: true
	}
*/
const COINS_FOR_SUPREME = 3;

// rematch is an optional bool parameter that uses a rematch power which is essentially a soft undo
export default function undoGame (state, game, rematch) {
	const winnerUuid = game.winner.uuid;
	const winningCharacterUuid = game.winner.characterUuid;
	const loserUuid = game.loser.uuid;
	const losingCharacterUuid = game.loser.characterUuid;
	const winningCharPrevValue = game.winner.value;

	let diff = {
		users: {
			ids: {},
			result: []
		},
		// removing something like championUuid should go in here
		_remove: {}
	};

	diff._remove.championUuid = unEvaluateChampion(winnerUuid, state.goal, state.users.ids[winnerUuid].score, state.users.ids[loserUuid].score, winningCharPrevValue);

	diff.users.ids[winnerUuid] = {
		score: state.users.ids[winnerUuid].score - winningCharPrevValue,
		streak: game.winner.streak,
		characters: {
			ids: {
				[winningCharacterUuid]: {
					streak: game.winner.characterStreak
				}
			},
			result: [winningCharacterUuid]
		}
	};
	// rematches don't reset the wins, only the streaks
	if (!rematch) {
		diff.users.ids[winnerUuid].wins = state.users.ids[winnerUuid].wins - 1;
		diff.users.ids[winnerUuid].characters.ids[winningCharacterUuid].wins = state.users.ids[winnerUuid].characters.ids[winningCharacterUuid].wins - 1;
	}
	diff.users.result.push(winnerUuid);

	if (state.users.ids[winnerUuid].characters.ids[winningCharacterUuid].value !== winningCharPrevValue) {
		diff.users.ids[winnerUuid].characters.ids[winningCharacterUuid].value = winningCharPrevValue;
	}

	diff.users.ids[loserUuid] = {
		streak: game.loser.streak,
		characters: {
			ids: {
				[losingCharacterUuid]: {
					value: state.users.ids[loserUuid].characters.ids[losingCharacterUuid].value - 1,
					streak: game.loser.characterStreak
				}
			},
			result: [losingCharacterUuid]
		}
	};
	// rematches don't reset the losses, only the streaks
	if (!rematch) {
		diff.users.ids[loserUuid].losses = state.users.ids[loserUuid].losses - 1;
		diff.users.ids[loserUuid].characters.ids[losingCharacterUuid].losses = state.users.ids[loserUuid].characters.ids[losingCharacterUuid].losses - 1;
	}
	diff.users.result.push(loserUuid);

	// undo fire
	const undoFireUuid = undoFireStatus(winningCharacterUuid, state.users.ids[winnerUuid].characters.ids[winningCharacterUuid].streak);

	// iterate through each of winner's characters and incr fireWins for characters already on fire
	state.users.ids[winnerUuid].characters.result.forEach(cUuid => {
		if (alreadyOnFire(state.users.ids[winnerUuid].characters.ids[cUuid].streak) && winningCharacterUuid !== cUuid) {
			// decr the fireWins for this character that is already on fire
			if (!diff.users.ids[winnerUuid].characters.ids[cUuid]) {
				diff.users.ids[winnerUuid].characters.ids[cUuid] = {};
				diff.users.ids[winnerUuid].characters.result.push(cUuid);
			}
			diff.users.ids[winnerUuid].characters.ids[cUuid].fireWins = state.users.ids[winnerUuid].characters.ids[cUuid].fireWins - 1;
		}
		if (undoFireUuid && (cUuid !== undoFireUuid)) {
			// character went on fire, it's not this one, decr value for all other characters
			if (!diff.users.ids[winnerUuid].characters.ids[cUuid]) {
				diff.users.ids[winnerUuid].characters.ids[cUuid] = {};
				diff.users.ids[winnerUuid].characters.result.push(cUuid);
			}
			diff.users.ids[winnerUuid].characters.ids[cUuid].value = state.users.ids[winnerUuid].characters.ids[cUuid].value - 1;
		}
	});

	//undo ice
	const undoIceUuid = undoIceStatus(losingCharacterUuid, game.loser.characterStreak);
	state.users.ids[loserUuid].characters.result.forEach(cUuid => {
		if (undoIceUuid && (cUuid !== undoIceUuid)) {
			// we're undoing a character being iced, it's not this one, so incr value for all other characters that previously went down
			if (!diff.users.ids[loserUuid].characters.ids[cUuid]) {
				diff.users.ids[loserUuid].characters.ids[cUuid] = {};
				diff.users.ids[loserUuid].characters.result.push(cUuid);
			}
			diff.users.ids[loserUuid].characters.ids[cUuid].value = state.users.ids[loserUuid].characters.ids[cUuid].value + 1;
		}
	});

	const coinsDiff = undoCoins(state.users.ids[winnerUuid].coins, state.users.ids[winnerUuid].streak, game.supreme);
	if (coinsDiff) {
		diff.users.ids[winnerUuid].coins = coinsDiff;
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

export function undoIceStatus (characterId, currentStreak) {
	if (currentStreak < 3) {
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
