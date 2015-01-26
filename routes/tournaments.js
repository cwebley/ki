var express = require('express'),
	cookieParser = require('cookie-parser'),
	session = require('cookie-session'),
	users = require('../modules/users'),
	dto = require('../modules/dto'),
	tournaments = require('../modules/tournaments');


var app = express();
app.use(cookieParser())
app.use(session({keys:['key1']}))
app.use(express.static(__dirname + '/public'))

var tourneyController = {};

var getTourneyOpts = function(req){
	var opts = {
		name: req.body.name,
		goal: dto.positive(req.body.goal),
		players: (req.body.opponent)?[req.session.username,req.body.opponent]:[],
		surrender: req.body.surrender || false
	}
	return opts
}


tourneyController.newTourneyForm = function(req, res){
	if(!req.session.username) return res.redirect('/')

	users.getUserList(req.session.username, function(err,dto){
		if(err) return res.status(500).send({success:false,err:err})
		dto.username=req.session.username
		res.render('create-tournament',dto)
	})
}

tourneyController.postNewTourney = function(req, res){
	if(!req.session.username) return res.redirect('/')

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
	if(!req.session.username) return res.redirect('/')

	var tourneyName = req.params.tourneyName
	var peek = (req.query.peek || req.body.peek) ? 4: 1

	tournaments.getAllTourneyStats(tourneyName,peek, function(err,dto){
		if(err) return res.status(500).send({success:false,err:err})
		if(!dto) {
			return res.redirect('/tournaments')
		}
		dto.title = tourneyName
		res.render('tournament',dto)
	})
}

tourneyController.edit = function(req, res){
	if(!req.session.username) return res.redirect('/')

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
	if(!req.session.username) return res.redirect('/')
	var tourneyName = req.params.tourneyName

	tournaments.getTourneyInfo(tourneyName, function(err,results){
		if(err) return res.status(500).send({success:false,err:err})
		if(!results) return res.status(404).send({success:false,reason:"tournament-not-found"})
		results.title = tourneyName
		res.render('tournament-edit',results)
	})
}


tourneyController.getTourneyList = function(req, res){
	if(!req.session.username) return res.redirect('/')

	tournaments.getTourneyList(function(err,dto){
		if(err) return res.status(500).send({success:false,err:err})
		dto.username = req.session.username
		res.render('tournament-home',dto)
	})
}


app.get('/',
  tourneyController.getTourneyList
);

app.get('/new', 
 	tourneyController.newTourneyForm
);

app.post('/new', 
 	tourneyController.postNewTourney
);

app.get('/:tourneyName', 
 	tourneyController.get
);

app.post('/:tourneyName/edit', 
 	tourneyController.edit
);

app.get('/:tourneyName/edit', 
 	tourneyController.editTourneyForm
);

module.exports = app;
