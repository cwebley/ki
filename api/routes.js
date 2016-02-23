import express from 'express';
import r from './reasons';

var router = express.Router();

router.get('/', (req, res) => {
    res.status(200).send({hello: 'world'});
});

router.post('/register', (req, res) => {
    let opts = {
        username: req.body.username,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        email: req.body.email
    };

    let problems = [];

    if (!opts.username) {
        problems.push(r.NoUsername);
    }
    if (!opts.password) {
        problems.push(r.NoPassword);
    }
    if (!opts.confirmPassword) {
        problems.push(r.NoConfirmPassword);
    }
    if (!opts.email) {
        problems.push(r.NoEmail);
    }
    if (problems.length) {
        return res.status(400).send(r(...problems));
    }

    if (opts.username.length > 15 || !isAlphaNumeric(opts.username)) {
        problems.push(r.InvalidUsername);
    }
    if (opts.password.length > 255) {
        problems.push(r.PasswordLength);
    }
    if (opts.password !== opts.confirmPassword) {
        problems.push(r.PasswordMismatch);
    }
    let splitEmail = opts.email.split('@');
    if (splitEmail.length !== 2 || splitEmail[1].indexOf('.') === -1) {
        problems.push(r.InvalidEmail);
    }
    if (problems.length) {
        return res.status(400).send(r(...problems));
    }

    // DO SOMETHING
    
});

function isAlphaNumeric (str) {
    for (let i = 0; i < str.length; i++) {
        let code = str.charCodeAt(i);
        console.log("CODE: ", code)
        if (!(code > 47 && code < 58) && //numeric 0-9
            !(code > 64 && code < 91) && // upper alpha A-Z
            !(code > 96 && code < 123)) { // lower alpha a-z
            return false;
        }
        return true;
    }
}

export default router;
