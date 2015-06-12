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

var gePostInspectOpts = function(req){
	opts = {
		username: req.user.name,
		userId: req.session.user.userId,
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
	console.log("POST INSPECT")
	var opts = gePostInspectOpts(req);
	console.log("OPTS: ", opts)
	if(!opts.matchups){
		res.status(400).send({success: false, reason:'matchup-data-not-provided'});
	}

	powerups.postInspect(opts, function(err,dto){
		if(err) return res.status(500).send({success:false,err:err});
		if(!dto) return res.status(400).send({success:false,reason:'invalid-inputs'});
		res.status(201).send({success: true});
	});
}

module.exports = powerupController;
