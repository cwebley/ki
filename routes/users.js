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
	//TODO dto this stuff
	var opts = {
		username: req.body.username,
		email: req.body.email || "",
		password: req.body.password,
		confirmation: req.body.confirmation
	}
	return opts
}

controller.login = function(req, res)	{
	var opts = getUserOpts(req)
	if(!opts.username)return res.redirect('/')
	if(!opts.password)return res.redirect('/')

	users.login(opts,function(err,results){
		if(err) return res.status(500).send({success:false,reason:"internal-error",err:err})
		if(!results) return res.status(400).send({success:false,reason:"user-not-found"})
		req.session.username = opts.username
		res.redirect('/tournaments');
	});
};

controller.registerForm = function(req, res){
	res.render('register');
};

controller.register = function(req, res){
	var opts = getUserOpts(req)
	if(!opts.username || !opts.password){
		return res.status(400).send({success:false,reason:"no-username-or-password"})
	}
	if(opts.password !== opts.confirmation){
		return res.status(400).send({success:false,reason:"password-confirmation-invalid"})
	}
	if(opts.username.length > 50) return res.status(400).send({succses:false,reason: "username-too-long"})
	if(opts.password.length > 50) return res.status(400).send({succses:false,reason: "password-too-long"})
	if(opts.email.length > 255) return res.status(400).send({succses:false,reason: "email-too-long"})

	users.register(opts, function(err,results){
		if(err) return res.status(500).send({success:false,reason:err})
		if(!results) return res.redirect('/')
		req.session.username = opts.username
		res.redirect('/tournaments');
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
app.post('/login', 
 	controller.login
);
app.post('/login', 
 	controller.login
);
app.get('/register', 
 	controller.registerForm
);
app.post('/register', 
 	controller.register
);
app.put('/seed/:username', 
 	controller.seed
);

