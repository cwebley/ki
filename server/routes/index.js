var express = require('express'),
	jwt = require('jwt-simple'),
	users = require('../modules/users'),
	auth = require('../modules/auth');

var app = express(),
	controller = {};

var getUserOpts = function(req){
	var opts = {
		username: req.body.username,
		email: req.body.email || "",
		password: req.body.password,
		confirmation: req.body.confirmation
	}
	return opts
}

// TODO username/password over SSL
controller.login = function(req, res, next){
	var opts = getUserOpts(req);
	if(!opts.username)return res.status(400).send({success:false,reason:"no-username"});
	if(!opts.password)return res.status(400).send({success:false,reason:"no-password"});

    auth.authenticate(opts,function(err,token){
    	if(err) return res.status(500).send({reason:'authentication-error',err:err});
    	if(!token) return res.status(401).send({reason:'invalid-username-or-password'});
    	return res.status(200).json({token:token});
    });
};

controller.register = function(req, res){
	var opts = getUserOpts(req)
	if(!opts.username || !opts.password){
		return res.status(400).send({success:false,reason:"no-username-or-password"});
	}
	if(opts.password !== opts.confirmation){
		return res.status(400).send({success:false,reason:"password-confirmation-invalid"});
	}
	if(opts.username.length > 50) return res.status(400).send({success:false,reason: "username-too-long"});
	if(opts.password.length > 50) return res.status(400).send({success:false,reason: "password-too-long"});
	if(opts.email.length > 255) return res.status(400).send({success:false,reason: "email-too-long"});

	auth.register(opts,function(err,token){
		if(err) return res.status(500).send({reason:'registration-error',err:err});
		if(!token) return res.status(401).send({reason:'username-already-exists'}); //only possible reason for no token
		return res.status(200).json({token:token});
	});
};

app.post('/login',
	controller.login
);

app.post('/register',
 	controller.register
);

module.exports = app
