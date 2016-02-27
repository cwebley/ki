import express from 'express';
import jwt from 'express-jwt';

import config from './config';

// handlers
import createCharacter from './handlers/create-character';
import registerUser from './handlers/register-user';
import loginUser from './handlers/login-user';
import createTournament from './handlers/create-tournament';

let router = express.Router();

// validates token and sets req.user with token data
let requiresLogin = jwt({secret: config.jwt.secret});

router.post('/user/register', registerUser);
router.post('/user/login', loginUser);

router.post('/character', createCharacter);

router.post('/tournament', requiresLogin, createTournament);

export default router;
