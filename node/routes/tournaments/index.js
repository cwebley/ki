var express = require('express'),
	cookieParser = require('cookie-parser'),
	session = require('cookie-session'),
	powerups = require('./powerups'),
	users = require('../../modules/users'),
	um = require('../../modules/users/middleware'),
	dto = require('../../modules/dto'),
	tournaments = require('../../modules/tournaments');


var app = express();
app.use(cookieParser())
app.use(session({keys:['key1']}))
app.use(express.static(__dirname + '/public'))

var tourneyController = {};

var getTourneyOpts = function(req){
	var opts = {
		name: req.body.name,
		goal: dto.positive(req.body.goal),
		players: (req.body.opponent)?[req.session.user.username,req.body.opponent]:[],
		surrender: req.body.surrender || false
	}
	return opts
}


tourneyController.newTourneyForm = function(req, res){
	users.getUserList(req.session.user.username, function(err,dto){
		if(err) return res.status(500).send({success:false,err:err})
		dto.username=req.session.user.username
		res.render('tournaments/create',dto)
	})
}

tourneyController.postNewTourney = function(req, res){

	if(!req.body.opponent) res.status(400).send({success:false,reason:'no-opponent-specified'})

	var opts = getTourneyOpts(req)
	if(!opts.name) return res.status(400).send({success:false,reason:'no-tourney-name'})
	if(!opts.goal) return res.status(400).send({success:false,reason:'no-tourney-goal'})

	tournaments.newTournament(opts, function(err,results){
		if(err) return res.status(500).send({success:false,err:err})
		res.redirect('/tournaments/' + opts.name)
	})
}

tourneyController.get = function(req, res){

	var tourneyName = req.params.tourneyName

	tournaments.getAllTourneyStats(tourneyName,function(err,dto){
		if(err) return res.status(500).send({success:false,err:err})
		if(!dto) {
			return res.redirect('/tournaments')
		}
		dto.title = tourneyName
		dto.me = req.session.user.username
		res.render('tournaments/home',dto)
	})
}

tourneyController.edit = function(req, res){

	var opts = getTourneyOpts(req)
	opts.oldName = req.params.tourneyName

	tournaments.editTournament(opts, function(err,d){
		if(err) return res.status(500).send({success:false,err:err})
		if(!d) {
			return res.redirect('/tournaments')
		}
		d.title = opts.name
		res.redirect('/tournaments/'+opts.name)
	})
}

tourneyController.editTourneyForm = function(req, res){
	var tourneyName = req.params.tourneyName

	tournaments.getTourneyInfo(tourneyName, function(err,results){
		if(err) return res.status(500).send({success:false,err:err})
		if(!results) return res.status(404).send({success:false,reason:"tournament-not-found"})
		results.title = tourneyName
		res.render('tournaments/edit',results)
	})
}


tourneyController.getTourneyList = function(req, res){

	tournaments.getTourneyList(function(err,dto){
		if(err) return res.status(500).send({success:false,err:err})
		dto.username = req.session.user.username
		res.render('tournaments/index',dto)
	})
}


app.get('/',
	um.requiresUser,
	tourneyController.getTourneyList
);

app.get('/new',
	um.requiresUser,
 	tourneyController.newTourneyForm
);

app.post('/new',
	um.requiresUser,
 	tourneyController.postNewTourney
);

app.get('/:tourneyName',
	um.requiresUser,
 	tourneyController.get
);

app.post('/:tourneyName/edit',
	um.requiresUser,
 	tourneyController.edit
);

app.get('/:tourneyName/edit',
	um.requiresUser,
 	tourneyController.editTourneyForm
);

app.get('/:tourneyName/pwr/inspect',
	um.requiresUser,
 	powerups.getInspect
);

app.post('/:tourneyName/pwr/inspect',
	um.requiresUser,
 	powerups.postInspect
);

module.exports = app;
