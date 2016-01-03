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
						1,
					value: state.users[winnerId].characters[winningCharacterId].value > 1 ?
						state.users[winnerId].characters[winningCharacterId].value - 1 :
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
	// add a power for supreme
	if ( gameResult.supreme ) {
		diff[winnerId].powers = state.users[winnerId].powers + 1;
	}
	return diff;
}