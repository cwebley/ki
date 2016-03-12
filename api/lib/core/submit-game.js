// {
// 	winner: {
// 		uuid: 1,
// 		characterUuid: 1
// 	},
// 	loser: {
// 		uuid: 2,
// 		characterUuid: 2
// 	},
//  supreme: true
// };
export const COINS_FOR_SUPREME = 3;

export default function submitGame (state, gameResult) {
	const winnerUuid = gameResult.winner.uuid;
	const winningCharacterUuid = gameResult.winner.characterUuid;
	const loserUuid = gameResult.loser.uuid;
	const losingCharacterUuid = gameResult.loser.characterUuid;

	let diff = {
		championUuid: evaluateChampion(winnerUuid, state.goal, state.users[winnerUuid].score, state.users[loserUuid].score)
	};
	diff.users = {
		[winnerUuid]: {
			score: state.users[winnerUuid].score + state.users[winnerUuid].characters[winningCharacterUuid].value,
			wins: state.users[winnerUuid].wins + 1,
			streak: updateWinningStreak(state.users[winnerUuid].streak),
			bestStreak: updateBestStreak(state.users[winnerUuid].streak, state.users[winnerUuid].bestStreak),
			globalStreak: updateWinningStreak(state.users[winnerUuid].globalStreak),
			globalBestStreak: updateBestStreak(state.users[winnerUuid].streak, state.users[winnerUuid].bestStreak),
			tournamentStreak: updateTournamentStreak(state.users[winnerUuid].tournamentStreak, winnerUuid === diff.championUuid),
			tournamentBestStreak: updateBestStreak(state.users[winnerUuid].tournamentBestStreak),
			characters: {
				[winningCharacterUuid]: {
					wins: state.users[winnerUuid].characters[winningCharacterUuid].wins + 1,
					streak: updateWinningStreak(state.users[winnerUuid].characters[winningCharacterUuid].streak),
					bestStreak: updateBestStreak(state.users[winnerUuid].characters[winningCharacterUuid].streak,
						state.users[winnerUuid].characters[winningCharacterUuid].bestStreak),
					globalStreak: updateWinningStreak(state.users[winnerUuid].characters[winningCharacterUuid].globalStreak),
					globalBestStreak: updateBestStreak(state.users[winnerUuid].characters[winningCharacterUuid].globalStreak,
						state.users[winnerUuid].characters[winningCharacterUuid].globalBestStreak)
				}
			}
		},
		[loserUuid]: {
			streak: updateLosingStreak(state.users[loserUuid].streak),
			globalStreak: updateLosingStreak(state.users[loserUuid].streak),
			tournamentStreak: updateTournamentLosingStreak(state.users[loserUuid].tournamentStreak, !!diff.championUuid),
			losses: state.users[loserUuid].losses + 1,
			characters: {
				[losingCharacterUuid]: {
					losses: state.users[winnerUuid].characters[winningCharacterUuid].losses + 1,
					streak: updateLosingStreak(state.users[loserUuid].characters[losingCharacterUuid].streak),
					globalStreak: updateLosingStreak(state.users[loserUuid].characters[losingCharacterUuid].globalStreak),
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
	const newFireUuid = fireStatus(winningCharacterUuid, state.users[winnerUuid].characters[winningCharacterUuid].streak);

	// determine if losing character WAS on fire
	const newIceUuid = iceStatus(losingCharacterUuid, state.users[loserUuid].characters[losingCharacterUuid].streak);

	// iterate through each of winner's characters and incr fireWins for characters already on fire
	Object.keys(state.users[winnerUuid].characters).forEach(cUuid => {
		if (alreadyOnFire(state.users[winnerUuid].characters[cUuid].streak) && winningCharacterUuid !== cUuid) {
			// incr the fireWins for this character that is already on fire
				if (!diff.users[winnerUuid].characters[cUuid]) {
				diff.users[winnerUuid].characters[cUuid] = {};
			}
			diff.users[winnerUuid].characters[cUuid].fireWins = state.users[winnerUuid].characters[cUuid].fireWins + 1;
		}
		if (newFireUuid && (cUuid !== newFireUuid)) {
			// some character just went on fire, it's not this one, so bump up their value
			if (!diff.users[winnerUuid].characters[cUuid]) {
				diff.users[winnerUuid].characters[cUuid] = {};
			}
			diff.users[winnerUuid].characters[cUuid].value = state.users[winnerUuid].characters[cUuid].value + 1;
		}
	});

	if (newIceUuid) {
		Object.keys(state.users[loserUuid].characters).forEach(cUuid => {
			// someone was iced, so decr all values except that character
			if (cUuid !== newIceUuid) {
				if (!diff.users[loserUuid].characters[cUuid]) {
					diff.users[loserUuid].characters[cUuid] = {};
				}
				diff.users[loserUuid].characters[cUuid].value = state.users[loserUuid].characters[cUuid].value - 1;
			}
		});
	}

	return diff;
}

// champion must reach the goal score AND be ahead of his opponent, THEN win again
// basically there is always a comeback opportunity
export function evaluateChampion (winnerUuid, goal, winnerPrevScore, loserPrevScore) {
	if (winnerPrevScore < goal) {
		return undefined;
	}
	if (winnerPrevScore < loserPrevScore) {
		return undefined;
	}
	return winnerUuid;
}

export function updateTournamentStreak (prevStreak, isChampion) {
	if (!isChampion) {
		return undefined;
	}
	return updateWinningStreak(prevStreak);
}

export function updateTournamentLosingStreak(prevStreak, champExists) {
	if (!champExists) {
		return undefined;
	}
	return updateLosingStreak(prevStreak);
}

export function alreadyOnFire (streak) {
	if (streak >= 3) {
		return true;
	}
	return false;
}

// if winning character goes on fire after this game, return the characterId
export function fireStatus (characterUuid, prevStreak) {
	if (prevStreak === 2) {
		return characterUuid;
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

export function updateBestStreak (prevStreak, bestStreak) {
	const currentStreak = prevStreak + 1;
	if (currentStreak > bestStreak) {
		return currentStreak;
	}
	return undefined;
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
