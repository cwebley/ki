var express = require('express'),
	powerups = require('../../modules/powerups');

var router = express.Router();
var powerupController = {};

powerupController.getInspect = function(req, res){
	var opts = {
		user: req.user,
		tournament: req.tournament
	};
	powerups.getInspect(opts, function(err,dto){
		if(err) return res.status(500).send({success:false,err:err});
		if(!dto) return res.status(400).send({success:false,reason:'inspect-already-in-use'});
		res.status(200).send(dto);
	});
}

var getPostInspectOpts = function(req){
	opts = {
		user: req.user,
		tournament: req.tournament
	};
	/* 
		matchups: {
			g: [orchid,fulgore,wulf],
			bj: [spinal:cinder,aria]
		}	
	*/
	opts.matchups = req.body.matchups
	return opts;
}

powerupController.postInspect = function(req, res){
	var opts = getPostInspectOpts(req);
	if(!opts.matchups){
		return res.status(400).send({success: false, reason:'matchup-data-not-provided'});
	}

	powerups.postInspect(opts, function(err,dto){
		if(err) return res.status(500).send({success:false,err:err});
		if(!dto) return res.status(400).send({success:false,reason:'invalid-inputs'});
		res.status(200).send(dto);
	});
}

powerupController.oddsMaker = function(req, res){
	var opts = {
		username: req.user.name,
		userId: req.user.id,
		tourneySlug: req.params.tourneySlug,
		character: req.body.character
	};

	if(!opts.character){
		return res.status(400).send({success: false, reason:'odds-maker-character-not-provided'});
	}

	powerups.oddsMaker(opts, function(err,dto){
		if(err) return res.status(500).send({success:false,err:err});
		if(!dto) return res.status(400).send({success:false,reason:'invalid-inputs'});
		res.status(200).send(dto);
	});
}

powerupController.rematch = function(req, res){
	var opts = {
		username: req.user.name,
		userId: req.user.id,
		tourneySlug: req.params.tourneySlug
	};

	powerups.rematch(opts, function(err,dto){
		if(err) return res.status(500).send({success:false,err:err});
		if(!dto) return res.status(400).send({success:false,reason:'invalid-inputs'});
		res.status(200).send(dto);
	});
}

powerupController.jack = function(req,res){
	//TODO verify swap and adjustments
	var opts = {
		username: req.user.name,
		userId: req.user.id,
		tourneySlug: req.params.tourneySlug,
		swap: req.body.swap,
		adjustments: req.body.adjustments
	};
	console.log("JACK OPTS: ", JSON.stringify(opts,null,4), JSON.stringify(req.tournament,null,4))
	powerups.jack(opts, function(err,dto){
		if(err) return res.status(500).send({success:false,err:err});
		if(!dto) return res.status(400).send({success:false,reason:'invalid-inputs'});
		res.status(200).send(dto);
	});
}

module.exports = powerupController;
