import express from 'express';
import jwt from 'express-jwt';
import config from './config';
import { registerUserCtrl, loginUserCtrl } from './auth';
import { createTournamentCtrl } from './tournaments';
import createCharacter from './handlers/create-character';

let router = express.Router();
let requiresLogin = jwt({secret: config.jwt.secret});


// test route for jwts
// router.get('/protected', jwt({secret: config.jwt.secret}), (req, res) => {
// 	res.status(200).send({user: req.user});
// });

router.post('/user/register', registerUserCtrl);
router.post('/user/login', loginUserCtrl);

router.post('/character', createCharacter);

router.post('/tournament', requiresLogin, createTournamentCtrl)

export default router;
