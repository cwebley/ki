var express = require('express'),
	async = require('async'),
	powerups = require('./powerups'),
	constants = require('../../modules/constants'),
	users = require('../../modules/users'),
	um = require('../../modules/users/middleware'),
	dto = require('../../modules/dto'),
	auth = require('../../modules/auth'),
	tournaments = require('../../modules/tournaments'),
	history = require('../../modules/history'),
	userMdl = require('../../modules/users/users-model');

var app = express();

var tourneyController = {};

var getTourneyOpts = function(req){
	var opts = {
		name: req.body.name,
		slug: dto.sluggish(req.body.name),
		goal: dto.positive(req.body.goal),
		players: (req.body.opponent && (req.body.opponent !== req.user.name))?[req.user.name,req.body.opponent]:[],
		surrender: req.body.surrender || false
	}
	return opts
}

tourneyController.postNewTourney = function(req, res){

	if(!req.body.opponent) res.status(400).send({success:false,reason:'no-opponent-specified'})
	var opts = getTourneyOpts(req)

	if(!opts.name) return res.status(400).send({success:false,reason:'no-tourney-name'})
	if(!opts.goal) return res.status(400).send({success:false,reason:'no-tourney-goal'})

	tournaments.newTournament(opts, function(err,tid){
		if(err) return res.status(500).send({success:false,err:err})
		if(!tid) return res.status(400).send({success:false,reason:'invalid-or-duplicate-info'})
		opts.id = tid
		res.status(201).send(opts)
	})
}

tourneyController.get = function(req, res){
	var tourneySlug = req.params.tourneySlug;
	var requester = (req.user) ? req.user.name : '';
	tournaments.getAllTourneyStats(tourneySlug,requester,function(err,dto){
		if(err) return res.status(500).send({success:false,err:err})
		if(!dto) {
			return res.status(404).send();
		}
		dto.slug = tourneySlug
		res.status(200).send(dto)
	})
}

// todo: check that you're actually in the tournament;
tourneyController.deleteTourney = function(req, res){
	var tourneySlug = req.params.tourneySlug;
	tournaments.deleteTournament(tourneySlug,function(err,dto){
		if(err) return res.status(500).send({success:false,err:err})
		res.status(200).send({success: true})
	})
}

tourneyController.edit = function(req, res){

	var opts = getTourneyOpts(req)
	opts.oldSlug = req.params.tourneySlug
	if(!opts.name) return res.status(400).send({success:false,reason:'no-tourney-name'})

	tournaments.editTournament(opts, function(err,d){
		if(err) return res.status(500).send({success:false,err:err})
		res.status(201).send({success:true})
	})
}

tourneyController.getTourneyList = function(req, res){
	tournaments.getTourneyList(function(err,dto){
		if(err) return res.status(500).send({success:false,err:err})
		res.status(200).send(dto)
	})
}

// var verifyAdjustments = function(data){
// 	if(!data || !data.length){
// 		return false
// 	};
// 	var filtered = data.filter(function(character){
// 		// check that character is valid
// 		if(!character.name || constants.characters.indexOf(character.name) === -1){
// 			return false;
// 		}
// 		return true;
// 	});

// 	if(filtered.length !== data.length) {
// 		return false;
// 	}
// 	return true;
// };

var verifyCharacters = function(data,cb){
	if(!data || !data.length){
		return cb();
	};

	var charIdCalls = data.map(function(character){
		return function(done){
			userMdl.getCharacterId(character.name,done);
		}
	});
	async.parallel(charIdCalls,function(err,results){
		if(err) return cb(err);

		var hydrated = data.map(function(character,i){
			character.id = results[i]
			return character;
		});

		return cb(null,hydrated);
	});	
};


tourneyController.adjustPoints = function(req, res){
	verifyCharacters(req.body && req.body.adjustments,function(err,hydrated){

		if(err || !hydrated){
			res.status(400).send({success:false,reason:'malformed-data'});
		}
		
		var opts = {
			adjustments: req.body.adjustments,
			user: req.user,
			tourneySlug: req.params.tourneySlug
		}
		tournaments.adjustPoints(opts,function(err,dto){
			if(err) return res.status(500).send({success:false,err:err});
			if(!dto) return res.status(400).send({success:false});
			res.status(200).send(dto);
		});

	});
}

app.get('/',
	tourneyController.getTourneyList
);

/*
*	Auth Barrier
*/
app.use(auth.verifyToken);
app.use(auth.ensureAuthenticated);

app.post('/',
 	tourneyController.postNewTourney
);
app.get('/:tourneySlug',
 	tourneyController.get
);
app.delete('/:tourneySlug',
 	tourneyController.deleteTourney
);
app.post('/:tourneySlug/edit',
 	tourneyController.edit
);
app.get('/:tourneySlug/pwr/inspect',
 	powerups.getInspect
);
app.post('/:tourneySlug/pwr/inspect',
 	powerups.postInspect
);
app.post('/:tourneySlug/pwr/oddsmaker',
 	powerups.oddsMaker
);
app.post('/:tourneySlug/pwr/rematch',
 	powerups.rematch
);
app.post('/:tourneySlug/adjust-points',
	um.userInTournament,
 	tourneyController.adjustPoints
);

module.exports = app;
