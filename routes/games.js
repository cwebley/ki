var express = require('express'),
	passport = require('passport'),
	games = require('../modules/games');

var app = express();
var gameController = {};

//TODO dto this stuff?
var getGameOpts = function(req){
	var opts = {
		winningPlayer: req.body.winningPlayer || req.query.winningPlayer,
		winningCharacter: req.body.winningCharacter || req.query.winningCharacter,
		losingPlayer: req.body.losingPlayer || req.query.losingPlayer,
		losingCharacter: req.body.losingCharacter || req.query.losingCharacter,
		tournament: req.body.tournament || req.query.tournament,
		supreme: !!req.body.supreme || !!req.query.supreme
	}
	return opts
}

gameController.submitGame = function(req, res){
	var opts = getGameOpts(req)
	games.submitGame(opts, function(err,dto){
		if(err) return res.status(500).send({success:false,err:err})
		if(!dto) return res.status(400).send({success:false,reason:'invalid-inputs'})
		res.status(201).send({success:true})
	})
}

app.use(passport.initialize())
app.use(passport.authenticate('basic',{ session: false }))

app.post('/',
 	gameController.submitGame
);

module.exports = app;
