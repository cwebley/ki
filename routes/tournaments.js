var express = require('express'),
	tournaments = require('../modules/tournaments');


var router = express.Router();
var tourneyController = {};

var getTourneyOpts = function(req){
	var opts = {
		name: req.body.name,
		goal: req.body.goal,
		players: req.body.players
	}
	return opts
}

tourneyController.put = function(req, res){
	var opts = getTourneyOpts(req)
	if(!opts.name || !opts.goal) return res.status(400).send({success:false,reason:'no-name-or-goal'})
	if(!opts.players || !opts.players.length || opts.players.length != 2) return res.status(400).send({success:false,reason:'not-2-player'})

	tournaments.newTournament(opts, function(err,results){
		if(err) return res.status(500).send({success:false,err:err})
		res.send({success:true})
	})
}

router.get('/', function(req, res) {
  res.send('games hub, respond with resource');
});

router.put('/new', 
 	tourneyController.put
);

module.exports = router;
