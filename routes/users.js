var express = require('express'),
	users = require('../modules/users'),
	auth = require('../modules/auth'),
	constants = require('../modules/constants');


var app = module.exports = express();

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
		tourneySlug: req.params.tourneySlug,
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
console.log("OOOO: ", opts)

	var verified = users.verifySeeds(opts.characters)
	if(!verified) return res.status(400).send({success:false,reason:"character-seed-data-invalid"})

	users.seedCharacters(opts, function(err,results){
		if(err) return res.status(500).send({success:false,reason:"internal-error"})
		if(!results) return res.status(404).send({success:false,reason:"user-or-tourney-not-found"})

		// req.session.seeded[opts.tourneySlug] = true
		// return res.redirect('/tournaments/'+opts.tourneySlug);
		return res.status(201).send({success:true})
	});
};

controller.getPreviousSeeds = function(req, res){
	users.getPreviousSeeds(req.params.tourneySlug, req.user.name, function(err,dto){
		if(err) return res.status(500).send({success:false,reason:"internal-error"});
		if(!dto) return res.status(404).send({success:false,reason:"tourney-data-not-found"});

		return res.status(200).send(dto);
	});
};

/*
*	Auth Barrier
*/
app.use(auth.verifyToken);
app.use(auth.ensureAuthenticated);

app.post('/:tourneySlug/seed', 
 	controller.seed
);

app.get('/:tourneySlug/previous-seeds', 
 	controller.getPreviousSeeds
);

