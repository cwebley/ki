var express = require('express'),
	passport = require('passport'),
	users = require('../modules/users');

var app = express(),
	controller = {};

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

controller.login = function(req, res){
	var opts = getUserOpts(req)
	if(!opts.username)return res.status(400).send({success:false,reason:"no-username"})
	if(!opts.password)return res.status(400).send({success:false,reason:"no-password"})
	users.login(opts,function(err,dto){
		if(err) return res.status(500).send({success:false,reason:"internal-error",err:err})
		if(!dto) return res.status(400).send({success:false,reason:"user-not-found"})
		res.status(200).send(dto);
	});
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
		if(!dto) return res.status(400).send({success:false,reason:"username-already-exists"})

		res.status(201).send({success:true});
	})
};

app.use(passport.initialize()) //needed for the logout func

app.post('/login',
	controller.login
);

app.get('/logout',function(req,res){
	req.logout();
	res.redirect('/');
});

app.post('/register', 
 	controller.register
);

module.exports = app