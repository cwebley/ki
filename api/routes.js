import express from 'express';
import jwt from 'express-jwt';
import jwtDecode from 'jwt-decode';
import db from './persistence/pg';
import redis from './persistence/redis';
import config from './config';

// handlers
import getCharacters from './handlers/get-characters';
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
const requiresLogin = jwt({secret: config.jwt.secret});

// looks for a jwt token with user data, but doesn't require it
const acceptUser = (req, res, next) => {
	if (!req.headers.authorization || !req.headers.authorization.split(' ')[0] === 'Bearer') {
		return next();
	}
	const token = req.headers.authorization.split(' ')[1];
	req.user = jwtDecode(token);
	return next();
};


router.post('/user/register', registerUser);
router.post('/user/login', loginUser);

router.post('/characters', createCharacter);
router.get('/characters', getCharacters);

router.post('/tournaments', requiresLogin, createTournament);
router.get('/tournament/:tournamentSlug', acceptUser, getTournament);

// TODO: require login
// TODO: logged in user must be in the tournament
router.post('/tournament/:tournamentSlug/game', requiresLogin, submitGame);
router.put('/tournament/:tournamentSlug/game', requiresLogin, undoGame);

export default router;
