var express = require('express'),
	games = require('../modules/games');


var router = express.Router();
var gameController = {};

//TODO dto this stuff?
var getGameOpts = function(req){
	var opts = {
		winningPlayer: req.body.winningPlayer,
		winningCharacter: req.body.winningCharacter,
		losingPlayer: req.body.losingPlayer,
		losingCharacter: req.body.losingCharacter,
		tournament: req.body.tournament // TODO make this a header or cookie or something?
	}
	return opts
}

gameController.put = function(req, res){
	games.submitGame(getGameOpts(req), function(err,results){
		if(err) res.status(500).send(err)
		if(!results) res.status(400).send()
		res.send(results)
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
	if(!opts.name || !opts.goal) res.status(400).send({success:false,reason:'no-name-or-goal'})
	if(!opts.players || !opts.players.length || opts.players.length != 2) res.status(400).send({success:false,reason:'not-2-player'})

	games.newTournament(opts, function(err,results){
		if(err) return res.status(500).send({success:false,err:err})
		res.send({success:true})
	})
}

router.get('/', function(req, res) {
  res.send('games hub, respond with resource');
});

router.put('/submit', 
 	gameController.put
);

router.put('/tournament', 
 	gameController.newTournament
);


module.exports = router;
