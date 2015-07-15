var express = require('express'),
	auth = require('../modules/auth'),
	games = require('../modules/games'),
	history = require('../modules/history'),
	games = require('../modules/games');

var app = express();
var gameController = {};

var getGameOpts = function(req){
	return {
		winningPlayer: req.body.winningPlayer || req.query.winningPlayer,
		winningCharacter: req.body.winningCharacter || req.query.winningCharacter,
		losingPlayer: req.body.losingPlayer || req.query.losingPlayer,
		losingCharacter: req.body.losingCharacter || req.query.losingCharacter,
		slug: req.body.slug || req.query.slug,
		supreme: !!req.body.supreme || !!req.query.supreme
	};
}

gameController.submitGame = function(req, res){
	var opts = getGameOpts(req);

	games.submitGame(opts, function(err,dto){
		if(err) return res.status(500).send({success:false,err:err});
		if(!dto) return res.status(400).send({success:false,reason:'invalid-inputs'});
		dto.success = true;
		res.status(201).send(dto);
	})
}


gameController.undoLastGame = function(req, res){
	var requester = (req.user) ? req.user.name : '';

	history.undoLastGame(req.params.tourneySlug,requester,true,function(err,dto){
		if(err) return res.status(500).send({success: false, err: err});
		if(!dto) return res.status(400).send({success:false});
		res.status(200).send(dto);
	});
}

/*
*	Auth Barrier
*/
app.use(auth.verifyToken);
app.use(auth.ensureAuthenticated);

app.post('/',
 	gameController.submitGame
);

app.put('/:tourneySlug',
 	gameController.undoLastGame
);
module.exports = app;
