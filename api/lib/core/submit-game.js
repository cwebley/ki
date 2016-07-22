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
		championUuid: evaluateChampion(winnerUuid, state.goal, state.users.ids[winnerUuid].score, state.users.ids[loserUuid].score),
		previous: {
			ids: {
				[winnerUuid]: gameResult.winner,
				[loserUuid]: gameResult.loser,
			},
			result: [winnerUuid, loserUuid],
			supreme: gameResult.supreme
		},
		// if this submission IS a rematched game, then the updated tournament state must reflect that
		rematchAvailable: (gameResult.rematchSuccess === null || gameResult.rematchSuccess === undefined) ? true : false
	};
	diff.users = {
		ids: {
			[winnerUuid]: {
				score: state.users.ids[winnerUuid].score + state.users.ids[winnerUuid].characters.ids[winningCharacterUuid].value,
				wins: state.users.ids[winnerUuid].wins + 1,
				streak: updateWinningStreak(state.users.ids[winnerUuid].streak),
				globalStreak: updateWinningStreak(state.users.ids[winnerUuid].globalStreak),
				tournamentStreak: updateTournamentStreak(state.users.ids[winnerUuid].tournamentStreak, winnerUuid === diff.championUuid),
				characters: {
					ids: {
						[winningCharacterUuid]: {
							// raw value always goes down. if character is at 1, this can go down to 0.
							// useful for undos and rematches so the data isn't lost.
							rawValue: state.users.ids[winnerUuid].characters.ids[winningCharacterUuid].rawValue - 1,
							wins: state.users.ids[winnerUuid].characters.ids[winningCharacterUuid].wins + 1,
							streak: updateWinningStreak(state.users.ids[winnerUuid].characters.ids[winningCharacterUuid].streak),
							globalStreak: updateWinningStreak(state.users.ids[winnerUuid].characters.ids[winningCharacterUuid].globalStreak)
						}
					},
					result: [winningCharacterUuid]
				}
			},
			[loserUuid]: {
				streak: updateLosingStreak(state.users.ids[loserUuid].streak),
				globalStreak: updateLosingStreak(state.users.ids[loserUuid].streak),
				tournamentStreak: updateTournamentLosingStreak(state.users.ids[loserUuid].tournamentStreak, !!diff.championUuid),
				losses: state.users.ids[loserUuid].losses + 1,
				characters: {
					ids: {
						[losingCharacterUuid]: {
							losses: state.users.ids[loserUuid].characters.ids[losingCharacterUuid].losses + 1,
							streak: updateLosingStreak(state.users.ids[loserUuid].characters.ids[losingCharacterUuid].streak),
							globalStreak: updateLosingStreak(state.users.ids[loserUuid].characters.ids[losingCharacterUuid].globalStreak),
							value: updateLoserValue(state.users.ids[loserUuid].characters.ids[losingCharacterUuid].value),
							// this is the only way to reset raw value to 1: losing a game
							rawValue: updateLoserRawValue(state.users.ids[loserUuid].characters.ids[losingCharacterUuid].rawValue)
						}
					},
					result: [losingCharacterUuid]
				}
			}
		},
		result: [winnerUuid, loserUuid]
	}

	const winnerBestStreakDiff = updateBestStreak(state.users.ids[winnerUuid].streak, state.users.ids[winnerUuid].bestStreak);
	if (winnerBestStreakDiff) {
		diff.users.ids[winnerUuid].bestStreak = winnerBestStreakDiff;
	}
	const winnerGlobalBestStreakDiff = updateBestStreak(state.users.ids[winnerUuid].streak, state.users.ids[winnerUuid].bestStreak);
	if (winnerGlobalBestStreakDiff) {
		diff.users.ids[winnerUuid].globalBestStreak = winnerGlobalBestStreakDiff;
	}
	const winningCharacterGlobalBestStreakDiff = updateBestStreak(state.users.ids[winnerUuid].characters.ids[winningCharacterUuid].globalStreak,
		state.users.ids[winnerUuid].characters.ids[winningCharacterUuid].globalBestStreak);
	if (winningCharacterGlobalBestStreakDiff) {
		diff.users.ids[winnerUuid].characters.ids[winningCharacterUuid].globalBestStreak = winningCharacterGlobalBestStreakDiff;
	}
	const winnerTournamentBestStreakDiff =  updateBestStreak(state.users.ids[winnerUuid].tournamentBestStreak);
	if (winnerTournamentBestStreakDiff) {
		diff.users.ids[winnerUuid].tournamentBestStreak = winnerTournamentBestStreakDiff;
	}

	const coinsDiff = updateCoins(state.users.ids[winnerUuid].coins, state.users.ids[winnerUuid].streak, gameResult.supreme);
	if (coinsDiff) {
		diff.users.ids[winnerUuid].coins = coinsDiff;
	}

	const winCharValDiff = updateWinnerValue(state.users.ids[winnerUuid].characters.ids[winningCharacterUuid].value);
	if (winCharValDiff) {
		diff.users.ids[winnerUuid].characters.ids[winningCharacterUuid].value = winCharValDiff;
	}

	// determine if winning character is on fire
	const newFireUuid = fireStatus(winningCharacterUuid, state.users.ids[winnerUuid].characters.ids[winningCharacterUuid].streak);

	// determine if losing character WAS on fire
	const newIceUuid = iceStatus(losingCharacterUuid, state.users.ids[loserUuid].characters.ids[losingCharacterUuid].streak);

	// iterate through each of winner's characters and incr fireWins for characters already on fire
	state.users.ids[winnerUuid].characters.result.forEach(cUuid => {
		if (alreadyOnFire(state.users.ids[winnerUuid].characters.ids[cUuid].streak) && winningCharacterUuid !== cUuid) {
			// incr the fireWins for this character that is already on fire
			if (!diff.users.ids[winnerUuid].characters.ids[cUuid]) {
				diff.users.ids[winnerUuid].characters.ids[cUuid] = {};
				diff.users.ids[winnerUuid].characters.result.push(cUuid);
			}
			diff.users.ids[winnerUuid].characters.ids[cUuid].fireWins = state.users.ids[winnerUuid].characters.ids[cUuid].fireWins + 1;
		}
		if (newFireUuid && (cUuid !== newFireUuid)) {
			// some character just went on fire, it's not this one, so bump up their value
			if (!diff.users.ids[winnerUuid].characters.ids[cUuid]) {
				diff.users.ids[winnerUuid].characters.ids[cUuid] = {};
				diff.users.ids[winnerUuid].characters.result.push(cUuid);
			}
			diff.users.ids[winnerUuid].characters.ids[cUuid].value = state.users.ids[winnerUuid].characters.ids[cUuid].value + 1;
		}
	});

	if (newIceUuid) {
		state.users.ids[loserUuid].characters.result.forEach(cUuid => {
			// someone was iced, so decr all values except that character
			if (cUuid !== newIceUuid) {
				if (!diff.users.ids[loserUuid].characters.ids[cUuid]) {
					diff.users.ids[loserUuid].characters.ids[cUuid] = {};
					diff.users.ids[loserUuid].characters.result.push(cUuid);
				}

				// icing a character has the same logic as decrementing a winner's value. we can't drop below 1 pt so it could be undefined
				const decreasedValue = updateWinnerValue(state.users.ids[loserUuid].characters.ids[cUuid].value);

				// raw value always goes down one, even if the character is already at 1
				// we need this to accurately rematch and undo this game. otherwise this data is lost.
				diff.users.ids[loserUuid].characters.ids[cUuid].rawValue = state.users.ids[loserUuid].characters.ids[cUuid].rawValue - 1;

				// if the value changed, push the character on the result list
				if (decreasedValue) {
					diff.users.ids[loserUuid].characters.ids[cUuid].value = decreasedValue;
				}
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
	if (previousValue <= 1) {
		return undefined;
	}
	return previousValue - 1;
}

export function updateLoserValue (previousValue) {
	return previousValue + 1;
}

export function updateLoserRawValue (previousRawValue) {
	if (previousRawValue < 1) {
		return 1;
	}
	return previousRawValue + 1;
}

export function updateCoins (currentCoins, previousStreak, supreme) {
	let updatedCoins = currentCoins;
	if (previousStreak >= 2) {
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
