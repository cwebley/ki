var express = require('express'),
	users = require('../modules/users');


var router = express.Router();
var controller = {};

controller.login = function(req, res){
	console.log("LOGIN CTRLER")
	var opts = {name: "Cameron"}
	users.register(opts, function(err,results){
		console.log("REZ : ", results)
		res.send('login page ' + JSON.stringify(opts) + ' ' + results);

	})
}

controller.register = function(req, res){
	console.log("LOGIN CTRLER")
	var opts = {name: "Cameron"}
	users.register(opts, function(err,results){
		console.log("REZ : ", results)
		res.send('login page ' + JSON.stringify(opts) + ' ' + results);

	})
}

/* GET users listing. */
router.get('/', function(req, res) {
  res.send('respond with a resource');
});

router.get('/login', 
 	controller.login
);

router.put('/login', 
 	controller.login
);

router.get('/register', 
 	controller.login
);

router.put('/register', 
 	controller.login
);


module.exports = router;
