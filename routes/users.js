var express = require('express'),
	users = require('../modules/users');


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


module.exports = router;
