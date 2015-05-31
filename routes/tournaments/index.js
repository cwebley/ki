var express = require('express'),
	passport = require('passport'),
	powerups = require('./powerups'),
	users = require('../../modules/users'),
	um = require('../../modules/users/middleware'),
	dto = require('../../modules/dto'),
	auth = require('../../modules/auth'),
	tournaments = require('../../modules/tournaments');


var app = express();

// var allowCrossDomain = function(req, res, next) { 
// 	res.header('Access-Control-Allow-Origin', '*'); 
// 	res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
// 	next(); 
// }

var tourneyController = {};

var getTourneyOpts = function(req){
	var opts = {
		name: req.body.name,
		goal: dto.positive(req.body.goal),
		players: (req.body.opponent)?[req.user.name,req.body.opponent]:[],
		surrender: req.body.surrender || false
	}
	return opts
}

tourneyController.postNewTourney = function(req, res){

	if(!req.body.opponent) res.status(400).send({success:false,reason:'no-opponent-specified'})

	var opts = getTourneyOpts(req)
	if(!opts.name) return res.status(400).send({success:false,reason:'no-tourney-name'})
	if(!opts.goal) return res.status(400).send({success:false,reason:'no-tourney-goal'})

	tournaments.newTournament(opts, function(err,results){
		if(err) return res.status(500).send({success:false,err:err})
		if(!results) return res.status(400).send({success:false,reason:'invalid-or-duplicate-info'})
		res.status(201).send({success:true})
	})
}

tourneyController.get = function(req, res){
	var tourneySlug = req.params.tourneySlug

	tournaments.getAllTourneyStats(tourneySlug,function(err,dto){
		if(err) return res.status(500).send({success:false,err:err})
		if(!dto) {
			return res.status(404).send();
		}
		dto.slug = tourneySlug
		res.status(200).send(dto)
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

/*
*	Auth Barrier
*/
app.use(auth.verifyToken);
app.use(auth.ensureAuthenticated);

app.post('/new',
 	tourneyController.postNewTourney
);

app.get('/:tourneySlug',
 	tourneyController.get
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
