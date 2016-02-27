import express from 'express';
import jwt from 'express-jwt';
import config from './config';
import createCharacter from './handlers/create-character';
import registerUser from './handlers/register-user';
import loginUser from './handlers/login-user';

import { registerUserCtrl, loginUserCtrl } from './auth';
import { createTournamentCtrl } from './tournaments';

let router = express.Router();

// validates token and sets req.user with token data
let requiresLogin = jwt({secret: config.jwt.secret});

router.post('/user/register', registerUser);
router.post('/user/login', loginUser);

router.post('/character', createCharacter);

router.post('/tournament', requiresLogin, createTournamentCtrl)

export default router;
