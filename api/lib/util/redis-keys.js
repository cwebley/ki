export function upcomingList (tournamentUuid, userUuid) {
	return `${tournamentUuid}:${userUuid}:upcoming`;
}

export function previousList (tournamentUuid, userUuid) {
	return `${tournamentUuid}:${userUuid}:previous`;
}
