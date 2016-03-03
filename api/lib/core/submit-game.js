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
export const COINS_FOR_SUPREME = 3;

export default function submitGame (state, gameResult) {
	const winnerUuid = gameResult.winner.uuid;
	const winningCharacterUuid = gameResult.winner.characterUuid;
	const loserUuid = gameResult.loser.uuid;
	const losingCharacterUuid = gameResult.loser.characterUuid;

	let diff = {};
	diff.users = {
		[winnerUuid]: {
			score: state.users[winnerUuid].score + state.users[winnerUuid].characters[winningCharacterUuid].value,
			streak: updateWinningStreak(state.users[winnerUuid].streak),
			characters: {
				[winningCharacterUuid]: {
					streak: updateWinningStreak(state.users[winnerUuid].characters[winningCharacterUuid].streak)
				}
			}
		},
		[loserUuid]: {
			streak: updateLosingStreak(state.users[loserUuid].streak),
			characters: {
				[losingCharacterUuid]: {
					streak: updateLosingStreak(state.users[loserUuid].characters[losingCharacterUuid].streak),
					value: updateLoserValue(state.users[loserUuid].characters[losingCharacterUuid].value)
				}
			}
		}
	}

	const coinsDiff = updateCoins(state.users[winnerUuid].coins, state.users[winnerUuid].streak, gameResult.supreme);
	if (coinsDiff) {
		diff.users[winnerUuid].coins = coinsDiff;
	}

	const winCharValDiff = updateWinnerValue(state.users[winnerUuid].characters[winningCharacterUuid].value);
	if (winCharValDiff) {
		diff.users[winnerUuid].characters[winningCharacterUuid].value = winCharValDiff;
	}

	// determine if winning character is on fire
	const fire = fireStatus(winningCharacterUuid, state.users[winnerUuid].characters[winningCharacterUuid].streak);
	if (fire) {
		diff.users[winnerUuid].fire = fire;
	}
	// determine if losing character WAS on fire
	const ice = iceStatus(losingCharacterUuid, state.users[loserUuid].characters[losingCharacterUuid].streak);
	if (ice) {
		diff.users[loserUuid].ice = ice;
	}

	return diff;
}

// if winning character goes on fire after this game, return the characterId
export function fireStatus (characterId, previousStreak) {
	if (previousStreak === 2) {
		return characterId;
	}
	return undefined;
}

// if losing was iced this game, return the characterId
export function iceStatus (characterId, previousStreak) {
	if (previousStreak >= 3) {
		return characterId;
	}
	return undefined;
}

export function updateWinningStreak (previousStreak) {
	if (previousStreak < 0) {
		return 1;
	}
	return previousStreak + 1;
}

export function updateLosingStreak (previousStreak) {
	if (previousStreak > 0) {
		return -1;
	}
	return previousStreak - 1;
}

export function updateWinnerValue (previousValue) {
	if (previousValue === 1) {
		return undefined;
	}
	return previousValue - 1;
}

export function updateLoserValue (previousValue) {
	return previousValue + 1;
}

export function updateCoins (currentCoins, previousStreak, supreme) {
	let updatedCoins = currentCoins;
	if (previousStreak === 2 || previousStreak >= 4) {
		updatedCoins += 1;
	}
	if (supreme) {
		updatedCoins += COINS_FOR_SUPREME;
	}
	if (updatedCoins !== currentCoins) {
		return updatedCoins;
	}
	return undefined;
}
