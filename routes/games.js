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
		goal: req.body.goal
	}
	return opts
}

gameController.newTournament = function(req, res){
	console.log("PUT TOURNEY: ", req.body)
	var opts = getTourneyOpts(req)
	if(!opts.name || !opts.goal) res.status(400).send()

	games.newTournament(opts, function(err,results){
		if(err) res.status(500).send(err)
		if(!results) res.status(400).send()
		res.send(results)
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
