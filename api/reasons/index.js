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
r.InvalidUsername = 'Username must be between alphanumeric and less than 15 characters';
r.PasswordComplexity = 'Password must be between 6 and 256 characters';
r.PasswordMismatch = 'Password mismatch';
r.InvalidEmail = 'Invalid email';
r.DuplicateUsername = 'Username is already taken';

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
