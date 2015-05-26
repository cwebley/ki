var express = require('express'),
	passport = require('passport'),
	jwt = require('jwt-simple'),
	users = require('../modules/users');

var app = express(),
	controller = {};

app.use(passport.initialize())


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

//TODO username and password over SSL
controller.login = function(req, res, next){
	passport.authenticate('basic',function(err,user,info){
		if(err) return res.status(401).send({success:false,reason:"invalid-username-or-password"});
		if(!user) return res.status(401).send({success:false,reason:"no-user-found"});

		//user authenticated correctly. create a jwt token.
		var token = jwt.encode({username: user.name}, 'secret-secret'); //TODO secret in config
		res.status(200).json({token:token})

	})

	var opts = getUserOpts(req);
	if(!opts.username)return res.status(400).send({success:false,reason:"no-username"});
	if(!opts.password)return res.status(400).send({success:false,reason:"no-password"});
	users.login(opts,function(err,dto){
		if(err) return res.status(500).send({success:false,reason:"internal-error",err:err});
		if(!dto) return res.status(400).send({success:false,reason:"user-not-found"});
		res.status(200).send(dto);
	})(req,res,next);
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