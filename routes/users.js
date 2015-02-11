var express = require('express'),
	users = require('../modules/users'),
	um = require('../modules/users/middleware'),
	auth = require('../modules/auth'),
	passport=require('passport'),
	constants = require('../modules/constants');


var app = module.exports = express();

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

		// req.session.seeded[opts.tourneyName] = true
		// return res.redirect('/tournaments/'+opts.tourneyName);
		return res.status(201).send({success:true})
	});
};

app.use(passport.authenticate('basic',{ session: false }))

app.post('/:tourneyName/seed', 
	// um.requiresUser,
 	controller.seed
);

