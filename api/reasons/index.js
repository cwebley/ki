export default function r () {
	let reasons = [];
	for(var i=0; i<arguments.length; i++) {
		reasons.push({ text: arguments[i] });
	}
	return {
		reasons: reasons
	};
};

// Uppercase descriptions are strings

// register/login user
r.NoUsername = 'Missing username';
r.NoPassword = 'Missing password';
r.NoConfirmPassword = 'Missing confirmPassword';
r.NoEmail = 'Missing email';
r.InvalidUsername = 'Username must be less than 25 characters';
r.PasswordComplexity = 'Password must be between 6 and 256 characters';
r.PasswordMismatch = 'Password mismatch';
r.InvalidEmail = 'Invalid email';
r.DuplicateUsername = 'Username is already exists';

//tournaments and characters
r.NoName = 'Missing name';
r.NoGoal = 'Missing goal';
r.NoOpponentSlug = 'Missing opponentSlug';
r.InvalidOpponentSlug = 'Invalid opponentSlug. Opponent does not exist';
r.NoSeason = 'Missing season';
r.InavlidName = 'Name must be less than 25 characters';
r.InvalidGoal = 'Goal must be an integer greater than 0';
r.InvalidSeason = 'Season must be an integer greater than 0';
r.DuplicateTournamentName = 'Tournament name already exists';
r.DuplicateCharacterName = 'Character name already exists';

r.Internal = 'Internal server error';
r.InvalidCredentials = 'Invalid username or password';
r.NotFound = 'Resource not found';
r.Unauthorized = 'User unauthorized';
r.Forbidden = 'Resource forbidden';
r.Unique = 'Resource conflict, unique';

// Lowercase descriptions are single reason methods for convenience
Object.keys(r).forEach((k) => {
	r[k.charAt(0).toLowerCase() + k.slice(1)] = r(r[k]);
});
