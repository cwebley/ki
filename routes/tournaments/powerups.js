var express = require('express'),
	powerups = require('../../modules/powerups');

var router = express.Router();
var powerupController = {};

powerupController.getInspect = function(req, res){
	opts = {
		username: req.user.name,
		userId: req.user.id,
		tourneySlug: req.params.tourneySlug
	};

	powerups.getInspect(opts, function(err,dto){
		if(err) return res.status(500).send({success:false,err:err});
		if(!dto) return res.status(400).send({success:false,reason:'inspect-already-in-use'});
		res.status(200).send(dto);
	})
}

var getPostInspectOpts = function(req){
	opts = {
		username: req.user.name,
		userId: req.user.id,
		tourneySlug: req.params.tourneySlug
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

	powerups.postInspect(opts, function(err,success){
		if(err) return res.status(500).send({success:false,err:err});
		if(!success) return res.status(400).send({success:false,reason:'invalid-inputs'});
		res.status(201).send({success: true});
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

	powerups.oddsMaker(opts, function(err,success){
		if(err) return res.status(500).send({success:false,err:err});
		if(!success) return res.status(400).send({success:false,reason:'invalid-inputs'});
		res.status(200).send({success: true});
	});
}

module.exports = powerupController;
