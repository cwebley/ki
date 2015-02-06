var express = require('express'),
	powerups = require('../../modules/powerups');

var router = express.Router();
var powerupController = {};

powerupController.getInspect = function(req, res){
	opts = {
		username: req.session.user.username,
		userId: req.session.user.userId,
		tourneyName: req.params.tourneyName
	}

	powerups.getInspect(opts, function(err,dto){
		if(err) return res.status(500).send({success:false,err:err})
		if(!dto) return res.status(400).send({success:false,reason:'inspect-already-in-use'})
		dto.me = req.session.user.username
		res.render('powerups/inspect',dto)
	})
}

var getInspectOpts = function(req){
	opts = {
		username: req.session.user.username,
		userId: req.session.user.userId,
		tourneyName: req.params.tourneyName
	}
	return opts
}

powerupController.postInspect = function(req, res){
	var opts = getGameOpts(req)
	powerups.submitGame(opts, function(err,dto){
		if(err) return res.status(500).send({success:false,err:err})
		if(!dto) return res.status(400).send({success:false,reason:'invalid-inputs'})
		res.redirect('/tournaments/'+opts.tournament)
	})
}

module.exports = powerupController;
