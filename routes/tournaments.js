var express = require('express'),
	cookieParser = require('cookie-parser'),
	session = require('cookie-session'),
	tournaments = require('../modules/tournaments');


var app = express();
app.use(cookieParser())
app.use(session({keys:['key1']}))
app.use(express.static(__dirname + '/public'))

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

app.put('/new', 
 	tourneyController.put
);

app.get('/:tourneyName', 
 	tourneyController.get
);

module.exports = app;
