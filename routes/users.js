var express = require('express'),
	cookieParser = require('cookie-parser'),
	session = require('cookie-session'),
	users = require('../modules/users'),
	um = require('../modules/users/middleware'),
	auth = require('../modules/auth'),
	passport=require('passport'),
	constants = require('../modules/constants');


var app = module.exports = express();
app.use(cookieParser())
app.use(session({keys:['key1']}))

// app.use(auth.initializePassport)
app.use(passport.initialize())
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
	console.log("LOGIN: ")

	var opts = getUserOpts(req)
	if(!opts.username)return res.redirect('/')
	if(!opts.password)return res.redirect('/')

	users.login(opts,function(err,dto){
		if(err) return res.status(500).send({success:false,reason:"internal-error",err:err})
		if(!dto) return res.status(400).send({success:false,reason:"user-not-found"})
		req.session.user = dto.user
		req.session.seeded = dto.seeded
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

	users.register(opts, function(err,dto){
		if(err) return res.status(500).send({success:false,reason:err})
		if(!dto) return res.redirect('/') // user already exists

		req.session.user = dto.user
		res.redirect('/tournaments');
	})
};

var getSeedOpts = function(req){
	var opts = {
		username: req.body.opponent,
		tourneyName: req.params.tourneyName,
		characters: {}
	}
	delete req.body.opponent

	var c = constants.characters
	for(var i = 0; i < c.length; i++){
		opts.characters[c[i]] = req.body[c[i]]
	}
	return opts
}

controller.seed = function(req, res){
	if(!req.body.opponent) return res.status(400).send({success:false,reason:"no-opponent-name-for-seeding"})

	var opts = getSeedOpts(req)

	var verified = users.verifySeeds(opts.characters)
	if(!verified) return res.status(400).send({success:false,reason:"character-seed-data-invalid"})

	users.seedCharacters(opts, function(err,results){
		if(err) return res.status(500).send({success:false,reason:"internal-error"})
		if(!results) return res.status(404).send({success:false,reason:"user-or-tourney-not-found"})
		req.session.seeded[opts.tourneyName] = true
		return res.redirect('/tournaments/'+opts.tourneyName);
	});
};

controller.getSeedForm = function(req, res){
	users.getOpponentsNames(req.session.user.username,req.params.tourneyName, function(err,dto){
		if(err) return res.status(500).send({success:false,err:err})

		dto.username=req.session.user.username
		dto.characters = constants.characters
		dto.title = req.params.tourneyName
		res.render('tournaments/seed',dto)
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
app.get('/logout',function(req,res){

	req.logout();
	res.redirect('/users/login');

});

app.use(passport.authenticate('basic',{ session: false }))
app.get('/api/data',auth.ensureAuthenticated,function(req,res){

	res.json([
		{value: 'foo'},
		{value: 'bar'},
		{value: 'baz'}
	])
})
app.get('/register', 
 	controller.registerForm
);
app.post('/register', 
 	controller.register
);
app.get('/:tourneyName/seed', 
	um.requiresUser,
 	controller.getSeedForm
);
app.post('/:tourneyName/seed', 
	um.requiresUser,
 	controller.seed
);

