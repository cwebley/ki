import express from 'express';
import jwt from 'express-jwt';
import db from './persistence/pg';
import redis from './persistence/redis';
import config from './config';

// handlers
import createCharacter from './handlers/create-character';
import registerUser from './handlers/register-user';
import loginUser from './handlers/login-user';
import createTournament from './handlers/create-tournament';
import getTournament from './handlers/get-tournament';
import submitGame from './handlers/submit-game';
import undoGame from './handlers/undo-game';

let router = express.Router();

// sets req.db
router.use(db.middleware({
	releaseIn: 30*1000 // 30 seconds
}));

router.use(redis.middleware({
	releaseIn: 30*1000 // 30 seconds
}));

// validates token and sets req.user with token data
let requiresLogin = jwt({secret: config.jwt.secret});

router.post('/user/register', registerUser);
router.post('/user/login', loginUser);

router.post('/character', createCharacter);

router.post('/tournament', requiresLogin, createTournament);
router.get('/tournament/:tournamentSlug', getTournament);

// TODO: require login
// TODO: logged in user must be in the tournament
router.post('/tournament/:tournamentSlug/game', submitGame);
router.put('/tournament/:tournamentSlug/game', undoGame);

export default router;
