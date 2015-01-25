var express = require('express'),
	cookieParser = require('cookie-parser'),
	session = require('cookie-session'),
	users = require('../modules/users'),
	constants = require('../modules/constants');


var app = module.exports = express();
app.use(cookieParser())
app.use(session({keys:['key1']}))
app.use(express.static(__dirname + '/public'))

var controller = {};

var getUserOpts = function(req){
	var opts = {
		username: req.body.username,
		password: req.body.password
	}
	return opts
}

controller.login = function(req, res)	{
	if(req.body.username){
		req.session.username = req.body.username
		return res.redirect('/tournaments')
	}
	res.redirect('/')
};

controller.register = function(req, res){
	console.log("LOGIN CTRLER")
	var opts = {name: "Cameron"}
	users.register(opts, function(err,results){
		console.log("REZ : ", results)
		res.render('register');
	})
};

var getSeedOpts = function(req){
	var opts = {
		username: req.params.username,
		tourneyName: req.body.name,
		characters: {}
	}

	var c = constants.characters
	for(var i = 0; i < c.length; i++){
		opts.characters[c[i]] = req.body.seeds[c[i]]
	}
	return opts
}

controller.seed = function(req, res){
	if(!req.body.name) return res.status(400).send({success:false,reason:"no-name-of-tourney"})
	if(!req.body.seeds) return res.status(400).send({success:false,reason:"no-seeds"})

	var opts = getSeedOpts(req)

	users.seedCharacters(opts, function(err,results){
		if(err) return res.status(500).send({success:false,reason:"internal-error"})
		if(!results) return res.status(404).send({success:false,reason:"user-or-tourney-not-found"})
		return res.send({success: true});
	})
};

app.get('/', function(req, res) {
  res.send('users hub, respond with a resource');
});

app.get('/login', 
 	controller.login
);
app.put('/login', 
 	controller.login
);
app.post('/login', 
 	controller.login
);
app.get('/register', 
 	controller.register
);
app.put('/register', 
 	controller.register
);
app.put('/seed/:username', 
 	controller.seed
);

