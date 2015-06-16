var express = require('express'),
	passport = require('passport'),
	powerups = require('./powerups'),
	users = require('../../modules/users'),
	um = require('../../modules/users/middleware'),
	dto = require('../../modules/dto'),
	auth = require('../../modules/auth'),
	tournaments = require('../../modules/tournaments'),
	history = require('../../modules/history');


var app = express();

var tourneyController = {};

var getTourneyOpts = function(req){
	var opts = {
		name: req.body.name,
		slug: dto.sluggish(req.body.name),
		goal: dto.positive(req.body.goal),
		players: (req.body.opponent && (req.body.opponent !== req.user.name))?[req.user.name,req.body.opponent]:[],
		surrender: req.body.surrender || false
	}
	return opts
}

tourneyController.postNewTourney = function(req, res){

	if(!req.body.opponent) res.status(400).send({success:false,reason:'no-opponent-specified'})
	var opts = getTourneyOpts(req)

	if(!opts.name) return res.status(400).send({success:false,reason:'no-tourney-name'})
	if(!opts.goal) return res.status(400).send({success:false,reason:'no-tourney-goal'})

	tournaments.newTournament(opts, function(err,tid){
		if(err) return res.status(500).send({success:false,err:err})
		if(!tid) return res.status(400).send({success:false,reason:'invalid-or-duplicate-info'})
		opts.id = tid
		res.status(201).send(opts)
	})
}

tourneyController.get = function(req, res){
	var tourneySlug = req.params.tourneySlug;
	var requester = (req.user) ? req.user.name : '';
	tournaments.getAllTourneyStats(tourneySlug,requester,function(err,dto){
		if(err) return res.status(500).send({success:false,err:err})
		if(!dto) {
			return res.status(404).send();
		}
		dto.slug = tourneySlug
		res.status(200).send(dto)
	})
}

tourneyController.undoLastGame = function(req, res){
	var tourneySlug = req.params.tourneySlug;

	history.undoLastGame(tourneySlug,function(err,dto){
		console.log("CONTROLLER LEVEL: ", err, dto);
		res.status(200).send(dto);
	});
}

// todo: check that you're actually in the tournament;
tourneyController.deleteTourney = function(req, res){
	var tourneySlug = req.params.tourneySlug;
	tournaments.deleteTournament(tourneySlug,function(err,dto){
		if(err) return res.status(500).send({success:false,err:err})
		res.status(200).send({success: true})
	})
}

tourneyController.edit = function(req, res){

	var opts = getTourneyOpts(req)
	opts.oldSlug = req.params.tourneySlug
	if(!opts.name) return res.status(400).send({success:false,reason:'no-tourney-name'})

	tournaments.editTournament(opts, function(err,d){
		if(err) return res.status(500).send({success:false,err:err})
		res.status(201).send({success:true})
	})
}

tourneyController.getTourneyList = function(req, res){
	tournaments.getTourneyList(function(err,dto){
		if(err) return res.status(500).send({success:false,err:err})
		res.status(200).send(dto)
	})
}

app.get('/',
	tourneyController.getTourneyList
);

// TODO: put behind auth barrier
// TODO: make this more restful
app.get('/:tourneySlug/undo',
 	tourneyController.undoLastGame
);
/*
*	Auth Barrier
*/
app.use(auth.verifyToken);
app.use(auth.ensureAuthenticated);

app.post('/',
 	tourneyController.postNewTourney
);

app.get('/:tourneySlug',
 	tourneyController.get
);

app.delete('/:tourneySlug',
 	tourneyController.deleteTourney
);

app.post('/:tourneySlug/edit',
 	tourneyController.edit
);

app.get('/:tourneySlug/pwr/inspect',
 	powerups.getInspect
);

app.post('/:tourneySlug/pwr/inspect',
 	powerups.postInspect
);

module.exports = app;
