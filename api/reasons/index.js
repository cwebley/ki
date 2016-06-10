export default function r () {
	let reasons = [];
	for(var i=0; i<arguments.length; i++) {
		reasons.push(arguments[i]);
	}
	return {
		reasons: reasons
	};
};

// register/login user
r.NoUsername = {
	message: 'Missing username',
	field: 'username',
	level: 'error',
	id: 'noUsername'
};
r.NoPassword = {
	message: 'Missing password',
	field: 'password',
	level: 'error',
	id: 'noPassword'
};
r.NoConfirmPassword = {
	message: 'Missing confirmPassword',
	field: 'confirmPassword',
	level: 'error',
	id: 'noConfirmPassword'
};
r.NoEmail = {
	message: 'Missing email',
	field: 'email',
	level: 'error',
	id: 'noEmail'
};
r.InvalidUsername = {
	message: 'Username must be less than 25 characters',
	field: 'username',
	level: 'error',
	id: 'invalidUsername'
};
r.PasswordComplexity = {
	message: 'Password must be between 6 and 256 characters',
	field: 'password',
	level: 'error',
	id: 'PasswordComplexity'
};
r.PasswordMismatch = {
	message: 'Password mismatch',
	field: 'confirmPassword',
	level: 'error',
	id: 'passwordMismatch'
};
r.InvalidEmail = {
	message: 'Invalid email',
	field: 'email',
	level: 'error',
	id: 'invalidEmail'
};
r.DuplicateUsername = {
	message: 'Username is already exists',
	field: 'username',
	level: 'error',
	id: 'duplicateUsername'
};

// tournaments and characters
r.NoName = {
	message: 'Missing name',
	field: 'name',
	level: 'error',
	id: 'noName'
};
r.NoGoal = {
	message: 'Missing goal',
	field: 'goal',
	level: 'error',
	id: 'noGoal'
};
r.NoStartCoins = {
	message: 'Missing startCoins',
	field: 'startCoins',
	level: 'error',
	id: 'noStartCoins'
};
r.NoOpponentSlug = {
	message: 'Missing opponentSlug',
	field: 'opponentSlug',
	level: 'error',
	id: 'NoOpponentSlug'
};
r.NoCharactersPerUser = {
	message: 'Missing charactersPerUser',
	field: 'charactersPerUser',
	level: 'error',
	id: 'noCharactersPerUser'
}
r.InvalidOpponentSlug = {
	message: 'Invalid opponentSlug. Opponent does not exist',
	field: 'opponentSlug',
	level: 'error',
	id: 'InvalidOpponentSlug'
};
r.NoSeason = {
	message: 'Missing season',
	field: 'season',
	level: 'error',
	id: 'noSeason'
};
r.InavlidName = {
	message: 'Name must be less than 25 characters',
	field: 'name',
	level: 'error',
	id: 'invalidName'
};
r.InvalidGoal = {
	message: 'Goal must be an integer greater than 0',
	field: 'goal',
	level: 'error',
	id: 'invalidGoal'
};
r.InvalidSeason = {
	message: 'Season must be an integer greater than 0',
	field: 'season',
	level: 'error',
	id: 'invalidSeason'
};
r.DuplicateTournamentName = {
	message: 'Tournament name already exists',
	field: 'name',
	level: 'error',
	id: 'duplicateTournamentName'
};
r.DuplicateCharacterName = {
	message: 'Character name already exists',
	field: 'message',
	level: 'error',
	id: 'duplicateCharacterName'
};

r.NoSlugParam = {
	message: 'Missing slug parameter',
	field: 'slug',
	level: 'error',
	id: 'noSlugParam'
};
r.TournamentNotFound = {
	message: 'Tournament not found',
	field: 'tournament',
	level: 'error',
	id: 'tournamentNotFound'
};
r.GameNotFound = {
	message: 'Game not found',
	field: 'game',
	level: 'error',
	id: 'gameNotFound'
};

// submit games
r.NoWinningUserSlug = {
	message: 'Missing winningUserSlug',
	field: 'winningUserSlug',
	level: 'error',
	id: 'noWinningUserSlug'
};
r.NoWinningCharacterSlug = {
	message: 'Missing winningCharacterSlug',
	field: 'winningCharacterSlug',
	level: 'error',
	id: 'noWinningCharacterSlug'
};
r.NoLosingUserSlug = {
	message: 'Missing losingUserSlug',
	field: 'losingUserSlug',
	level: 'error',
	id: 'noLosingUserSlug'
};
r.NoLosingCharacterSlug = {
	message: 'Missing losingCharacterSlug',
	field: 'losingCharacterSlug',
	level: 'error',
	id: 'noLosingCharacterSlug'
};
r.InvalidWinningUserSlug = {
	message: 'Invalid winningUserSlug',
	field: 'winningUserSlug',
	level: 'error',
	id: 'invalidWinningUserSlug'
};
r.InvalidWinningCharacterSlug = {
	message: 'Invalid winningCharacterSlug',
	field: 'winningCharacterSlug',
	level: 'error',
	id: 'invalidWinningCharacterSlug'
};
r.InvalidLosingUserSlug = {
	message: 'Invalid losingUserSlug',
	field: 'losingUserSlug',
	level: 'error',
	id: 'invalidLosingUserSlug'
};
r.InvalidLosingCharacterSlug = {
	message: 'Invalid losingCharacterSlug',
	field: 'losingCharacterSlug',
	level: 'error',
	id: 'invalidLosingCharacterSlug'
};
r.InvalidMyCharacters = {
	message: 'myCharacters must be an array',
	field: 'myCharacters',
	level: 'error',
	id: 'invalidMyCharacters'
};
r.InvalidOpponentCharacters = {
	message: 'opponentCharacters must be an array',
	field: 'opponentCharacters',
	level: 'error',
	id: 'invalidOpponentCharacters'
};
r.InvalidDraftCharacters = {
	message: 'draftCharacters must be an array',
	field: 'draftCharacters',
	level: 'error',
	id: 'invalidDraftCharacters'
};
r.InvalidCharactersPerUser = {
	message: 'invalid charactersPerUser',
	field: 'charactersPerUser',
	level: 'error',
	id: 'invalidCharactersPerUser'
};
r.MyCharacterNotFound = (invalidCharacters) => ({
	message: 'myCharacters contains one or more invalid characters',
	field: 'myCharacters',
	invalidCharacters: invalidCharacters,
	level: 'error',
	id: 'myCharacterNotFound'
});
r.OpponentCharacterNotFound = (invalidCharacters) => ({
	message: 'opponentCharacters contains one or more invalid characters',
	field: 'opponentCharacters',
	invalidCharacters: invalidCharacters,
	level: 'error',
	id: 'opponentCharacterNotFound'
});
r.DraftCharacterNotFound = (invalidCharacters) => ({
	message: 'draftCharacters contains one or more invalid characters',
	field: 'draftCharacters',
	invalidCharacters: invalidCharacters,
	level: 'error',
	id: 'draftCharacterNotFound'
});

r.Internal = {
	message: 'Internal server error',
	level: 'error',
	id: 'internal'
};
r.InvalidCredentials = {
	message: 'Invalid username or password',
	level: 'error',
	id: 'invalidCredentials'
};
r.NotFound = {
	message: 'Resource not found',
	level: 'error',
	id: 'resourceNotFound'
};
r.Unauthorized = {
	message: 'User unauthorized',
	level: 'error',
	id: 'unauthorized'
};
r.Forbidden = {
	message: 'Resource forbidden',
	level: 'error',
	id: 'forbidden'
};
r.Unique = {
	message: 'Resource conflict, unique',
	level: 'error',
	id: 'unique'
};

// Lowercase descriptions are single reason methods for convenience
Object.keys(r).forEach((k) => {
	r[k.charAt(0).toLowerCase() + k.slice(1)] = r(r[k]);
});
