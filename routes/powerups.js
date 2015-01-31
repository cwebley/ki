var express = require('express'),
	powerups = require('../modules/powerups');

var router = express.Router();
var powerupController = {};

// var getInspectOpts = function(req){
// 	var opts = {
// 		winningPlayer: req.body.winningPlayer || req.query.winningPlayer,
// 		winningCharacter: req.body.winningCharacter || req.query.winningCharacter,
// 		losingPlayer: req.body.losingPlayer || req.query.losingPlayer,
// 		losingCharacter: req.body.losingCharacter || req.query.losingCharacter,
// 		tournament: req.body.tournament || req.query.tournament,
// 		supreme: !!req.body.supreme || req.query.supreme
// 	}
// 	return opts
// }

powerupController.getInspect = function(req, res){
	var opts = {};
	powerups.getInspect(opts, function(err,dto){
		if(err) return res.status(500).send({success:false,err:err})
		if(!dto) return res.status(400).send({success:false,reason:'invalid-inputs'})

		res.send(dto)
	})
}

// powerupController.postInspect = function(req, res){
// 	var opts = getGameOpts(req)
// 	powerups.submitGame(opts, function(err,dto){
// 		if(err) return res.status(500).send({success:false,err:err})
// 		if(!dto) return res.status(400).send({success:false,reason:'invalid-inputs'})
// 		res.redirect('/tournaments/'+opts.tournament)
// 	})
// }

router.get('/', function(req, res) {
  res.redirect('/');
});

router.get('/inspect', 
 	powerupController.getInspect
);
// router.post('/inspect', 
//  	powerupController.postInspect
// );


module.exports = router;
