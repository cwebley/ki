var express = require('express'),
	users = require('../modules/users'),
	constants = require('../modules/constants');


var router = express.Router();
var controller = {};

controller.login = function(req, res){
	var opts = {name: "Cameron"}
	users.register(opts, function(err,results){
		console.log("REZ : ", results)
		res.render('login');

	})
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

router.get('/', function(req, res) {
  res.send('users hub, respond with a resource');
});

router.get('/login', 
 	controller.login
);
router.put('/login', 
 	controller.login
);
router.get('/register', 
 	controller.register
);
router.put('/register', 
 	controller.register
);
router.put('/seed/:username', 
 	controller.seed
);

module.exports = router;
