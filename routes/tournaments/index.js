var express = require('express'),
	passport = require('passport'),
	powerups = require('./powerups'),
	users = require('../../modules/users'),
	um = require('../../modules/users/middleware'),
	dto = require('../../modules/dto'),
	auth = require('../../modules/auth'),
	tournaments = require('../../modules/tournaments');


var app = express();

var allowCrossDomain = function(req, res, next) { 
	console.log('X DOMAIN')
	res.header('Access-Control-Allow-Origin', '*'); 
	res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
	next(); 
}

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
		res.status(201).send({success:true})
	})
}

tourneyController.get = function(req, res){
	console.log("GET TOURNEY: ")

	var tourneyName = req.params.tourneyName

	tournaments.getAllTourneyStats(tourneyName,function(err,dto){
		console.log("GET TOURNEY  DONE: ", err, dto)

		if(err) return res.status(500).send({success:false,err:err})
		if(!dto) {
			return res.redirect('/tournaments')
		}
		dto.title = tourneyName
		dto.me = req.user.name
		res.status(200).send(dto)
	})
}

tourneyController.edit = function(req, res){

	var opts = getTourneyOpts(req)
	opts.oldName = req.params.tourneyName

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
app.use(passport.initialize())
app.use(passport.authenticate('basic',{ session: false }))

app.post('/new',
 	tourneyController.postNewTourney
);

app.get('/:tourneyName',
 	tourneyController.get
);

app.post('/:tourneyName/edit',
 	tourneyController.edit
);

app.get('/:tourneyName/pwr/inspect',
 	powerups.getInspect
);

app.post('/:tourneyName/pwr/inspect',
 	powerups.postInspect
);

module.exports = app;
