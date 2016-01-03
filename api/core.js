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
			streak: state.users[winnerId].streak >= 0 ? state.users[winnerId].streak + 1 : 1,
			characters: {
				[winningCharacterId]: {
					streak: state.users[winnerId].characters[winningCharacterId].streak >= 0 ?
						state.users[winnerId].characters[winningCharacterId].streak + 1 :
						1
				}
			}
		},
		[loserId]: {
			streak: state.users[loserId].streak <= 0 ? state.users[loserId].streak - 1 : -1,
			characters: {
				[losingCharacterId]: {
					streak: state.users[loserId].characters[losingCharacterId].streak <= 0 ?
						state.users[loserId].characters[losingCharacterId].streak - 1 :
						-1,
					value: state.users[loserId].characters[losingCharacterId].value + 1
				}
			}
		}
	}

	if ( state.users[winnerId].characters[winningCharacterId].value > 1 ) {
		diff[winnerId].characters[winningCharacterId].value = state.users[winnerId].characters[winningCharacterId].value - 1;
	}
	// add a power for supreme
	if ( gameResult.supreme ) {
		diff[winnerId].powers = state.users[winnerId].powers + 1;
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

	// without more information, we can only figure out the previous streaks for the winner if they are currently above 1
	diff[winnerId].streak = state.users[winnerId].streak > 1 ?
		state.users[winnerId].streak - 1 :
		0;
	winningCharDiff.streak = state.users[winnerId].characters[winningCharacterId].streak > 1 ?
		state.users[winnerId].characters[winningCharacterId].streak - 1 :
		0;

	// only include the specific character in the diff if something has changed
	if ( Object.keys(winningCharDiff).length ) {
		diff[winnerId].characters[winningCharacterId] = winningCharDiff
	}

	diff[loserId] = {
		characters: {
			[losingCharacterId]: {
				value: state.users[loserId].characters[losingCharacterId].value - 1
			}
		}
	};
	
	// without more information, we can only figure out the previous streaks for the loser if they are currently below -1
	diff[loserId].streak = state.users[loserId].streak < -1 ?
		state.users[loserId].streak + 1 :
		0
	diff[loserId].characters[losingCharacterId].streak = state.users[loserId].characters[losingCharacterId].streak < -1 ?
	state.users[loserId].characters[losingCharacterId].streak + 1 :
	0

	// subtract a power for supreme
	if ( prevGame.supreme ) {
		diff[winnerId].powers = state.users[winnerId].powers - 1;
	}

	return diff;
}