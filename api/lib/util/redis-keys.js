export function upcomingList (tournamentUuid, userUuid) {
	return `${tournamentUuid}:${userUuid}:upcoming`;
}

export function previousList (tournamentUuid, userUuid) {
	return `${tournamentUuid}:${userUuid}:previous`;
}

// returns a user uuid if inspect is active
export function inspect (tournamentUuid) {
	return `${tournamentUuid}:inspect`;
}

// returns an integer number of inspect games remaining
export function userInspect (tournamentUuid, userUuid) {
	return `${tournamentUuid}:${userUuid}:inspect`;
}

export function userGrabbagKey (tournamentUuid, userUuid) {
	return `${tournamentUuid}:${userUuid}:grabbag`;
}
