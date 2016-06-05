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
	id: 'foo'
};
r.NoPassword = {
	message: 'Missing password',
	field: 'password',
	level: 'error',
	id: 'foo'
};
r.NoConfirmPassword = {
	message: 'Missing confirmPassword',
	field: 'confirmPassword',
	level: 'error',
	id: 'foo'
};
r.NoEmail = {
	message: 'Missing email',
	field: 'email',
	level: 'error',
	id: 'foo'
};
r.InvalidUsername = {
	message: 'Username must be less than 25 characters',
	field: 'username',
	level: 'error',
	id: 'foo'
};
r.PasswordComplexity = {
	message: 'Password must be between 6 and 256 characters',
	field: 'password',
	level: 'error',
	id: 'foo'
};
r.PasswordMismatch = {
	message: 'Password mismatch',
	field: 'confirmPassword',
	level: 'error',
	id: 'foo'
};
r.InvalidEmail = {
	message: 'Invalid email',
	field: 'email',
	level: 'error',
	id: 'foo'
};
r.DuplicateUsername = {
	message: 'Username is already exists',
	field: 'username',
	level: 'error',
	id: 'foo'
};

// tournaments and characters
r.NoName = {
	message: 'Missing name',
	field: 'name',
	level: 'error',
	id: 'foo'
};
r.NoGoal = {
	message: 'Missing goal',
	field: 'goal',
	level: 'error',
	id: 'foo'
};
r.NoStartCoins = {
	message: 'Missing startCoins',
	field: 'startCoins',
	level: 'error',
	id: 'foo'
};
r.NoOpponentSlug = {
	message: 'Missing opponentSlug',
	field: 'opponentSlug',
	level: 'error',
	id: 'foo'
};
r.InvalidOpponentSlug = {
	message: 'Invalid opponentSlug. Opponent does not exist',
	field: 'opponentSlug',
	level: 'error',
	id: 'foo'
};
r.NoSeason = {
	message: 'Missing season',
	field: 'season',
	level: 'error',
	id: 'foo'
};
r.InavlidName = {
	message: 'Name must be less than 25 characters',
	field: 'name',
	level: 'error',
	id: 'foo'
};
r.InvalidGoal = {
	message: 'Goal must be an integer greater than 0',
	field: 'goal',
	level: 'error',
	id: 'foo'
};
r.InvalidSeason = {
	message: 'Season must be an integer greater than 0',
	field: 'season',
	level: 'error',
	id: 'foo'
};
r.DuplicateTournamentName = {
	message: 'Tournament name already exists',
	field: 'name',
	level: 'error',
	id: 'foo'
};
r.DuplicateCharacterName = {
	message: 'Character name already exists',
	field: 'message',
	level: 'error',
	id: 'foo'
};

r.NoSlugParam = {
	message: 'Missing slug parameter',
	field: 'slug',
	level: 'error',
	id: 'foo'
};
r.TournamentNotFound = {
	message: 'Tournament not found',
	field: 'tournament',
	level: 'error',
	id: 'foo'
};
r.GameNotFound = {
	message: 'Game not found',
	field: 'game',
	level: 'error',
	id: 'foo'
};

// submit games
r.NoWinningUserSlug = {
	message: 'Missing winningUserSlug',
	field: 'winningUserSlug',
	level: 'error',
	id: 'foo'
};
r.NoWinningCharacterSlug = {
	message: 'Missing winningCharacterSlug',
	field: 'winningCharacterSlug',
	level: 'error',
	id: 'foo'
};
r.NoLosingUserSlug = {
	message: 'Missing losingUserSlug',
	field: 'losingUserSlug',
	level: 'error',
	id: 'foo'
};
r.NoLosingCharacterSlug = {
	message: 'Missing losingCharacterSlug',
	field: 'losingCharacterSlug',
	level: 'error',
	id: 'foo'
};
r.InvalidWinningUserSlug = {
	message: 'Invalid winningUserSlug',
	field: 'winningUserSlug',
	level: 'error',
	id: 'foo'
};
r.InvalidWinningCharacterSlug = {
	message: 'Invalid winningCharacterSlug',
	field: 'winningCharacterSlug',
	level: 'error',
	id: 'foo'
};
r.InvalidLosingUserSlug = {
	message: 'Invalid losingUserSlug',
	field: 'losingUserSlug',
	level: 'error',
	id: 'foo'
};
r.InvalidLosingCharacterSlug = {
	message: 'Invalid losingCharacterSlug',
	field: 'losingCharacterSlug',
	level: 'error',
	id: 'foo'
};

r.Internal = {
	message: 'Internal server error',
	level: 'error',
	id: 'foo'
};
r.InvalidCredentials = {
	message: 'Invalid username or password',
	level: 'error',
	id: 'foo'
};
r.NotFound = {
	message: 'Resource not found',
	level: 'error',
	id: 'foo'
};
r.Unauthorized = {
	message: 'User unauthorized',
	level: 'error',
	id: 'foo'
};
r.Forbidden = {
	message: 'Resource forbidden',
	level: 'error',
	id: 'foo'
};
r.Unique = {
	message: 'Resource conflict, unique',
	level: 'error',
	id: 'foo'
};

// Lowercase descriptions are single reason methods for convenience
Object.keys(r).forEach((k) => {
	r[k.charAt(0).toLowerCase() + k.slice(1)] = r(r[k]);
});
