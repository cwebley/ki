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
import submitSeeds from './handlers/submit-seeds';
import submitGame from './handlers/submit-game';
import draftCharacter from './handlers/draft-character';
import undoGame from './handlers/undo-game';
import rematch from './handlers/rematch';
import oddsmaker from './handlers/oddsmaker';
import decrementCharacter from './handlers/decrement-character';
import useInspect from './handlers/use-inspect';
import updateInspect from './handlers/update-inspect';
import editTournament from './handlers/edit-tournament';

let router = express.Router();

// sets req.db
router.use(db.middleware({
	releaseIn: 30 * 1000 // 30 seconds
}));

router.use(redis.middleware({
	releaseIn: 30 * 1000 // 30 seconds
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

// TODO: logged in user must be in the tournament
router.put('/tournament/:tournamentSlug', requiresLogin, editTournament);
router.post('/tournament/:tournamentSlug/seed', requiresLogin, submitSeeds);
router.post('/tournament/:tournamentSlug/game', requiresLogin, submitGame);
router.delete('/tournament/:tournamentSlug/game', requiresLogin, undoGame);
router.post('/tournament/:tournamentSlug/draft', requiresLogin, draftCharacter);

router.post('/tournament/:tournamentSlug/power/rematch', requiresLogin, rematch);
router.post('/tournament/:tournamentSlug/power/oddsmaker', requiresLogin, oddsmaker);
router.post('/tournament/:tournamentSlug/power/decrement', requiresLogin, decrementCharacter);
router.post('/tournament/:tournamentSlug/power/inspect', requiresLogin, useInspect);
router.put('/tournament/:tournamentSlug/power/inspect', requiresLogin, updateInspect);

export default router;
