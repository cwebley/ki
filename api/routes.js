import express from 'express';
import jwt from 'express-jwt';
import config from './config';
import { registerUserCtrl, loginUserCtrl } from './auth';
import { createTournamentCtrl } from './tournaments';

var router = express.Router();

// test route for jwts
// router.get('/protected', jwt({secret: config.jwt.secret}), (req, res) => {
// 	res.status(200).send({user: req.user});
// });

router.post('/register', registerUserCtrl);
router.post('/login', loginUserCtrl);

router.post('/tournament', jwt({secret: config.jwt.secret}), createTournamentCtrl)

export default router;
