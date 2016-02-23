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
r.PasswordLength = 'Password must be less than 256 characters';
r.PasswordMismatch = 'Password mismatch';
r.InvalidEmail = 'Invalid email';

r.Internal = 'Internal server error';
r.NotFound = 'Resource not found';
r.Unauthorized = 'User unauthorized';
r.Forbidden = 'Resource forbidden';
r.Unique = 'Resource conflict, unique';

// Lowercase descriptions are single reason methods for convenience
Object.keys(r).forEach((k) => {
    r[k.charAt(0).toLowerCase() + k.slice(1)] = r(r[k]);
});
