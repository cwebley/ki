var express = require('express'),
	games = require('../modules/games');

var router = express.Router();
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
		res.redirect('/tournaments/'+opts.tournament)
	})
}

router.get('/', function(req, res) {
  res.redirect('/');
});

router.post('/submit', 
 	gameController.submitGame
);


module.exports = router;
