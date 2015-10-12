export function submitGame(initialState) {
	const copyState = Object.assign({}, initialState);


	return {
		nextState: copyState,
		difference : {}
	}
}