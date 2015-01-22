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
		tournament: req.body.tournament || req.query.tournament, // TODO make this a header or cookie or something?,
		supreme: !!req.body.supreme || !!req.query.supreme
	}
	return opts
}

gameController.sumitGame = function(req, res){
	var opts = getGameOpts(req)
	games.submitGame(opts, function(err,dto){
		if(err) return res.status(500).send({success:false,err:err})
		if(!dto) return res.status(400).send({success:false,reason:'invalid-inputs'})
		res.redirect('localhost:3000/tournament/stats?name='+opts.tournament)
	})
}

var getTourneyOpts = function(req){
	var opts = {
		name: req.body.name,
		goal: req.body.goal,
		players: req.body.players
	}
	return opts
}

gameController.newTournament = function(req, res){
	var opts = getTourneyOpts(req)
	if(!opts.name || !opts.goal) return res.status(400).send({success:false,reason:'no-name-or-goal'})
	if(!opts.players || !opts.players.length || opts.players.length != 2) return res.status(400).send({success:false,reason:'not-2-player'})

	games.newTournament(opts, function(err,results){
		if(err) return res.status(500).send({success:false,err:err})
		res.send({success:true})
	})
}

router.get('/', function(req, res) {
  res.send('games hub, respond with resource');
});

router.get('/submit', 
 	gameController.sumitGame
);


module.exports = router;
