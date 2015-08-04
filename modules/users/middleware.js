var tourneyMdl = require('../tournaments/tournaments-model');

module.exports.requiresUser = function(req, res, next) {
	if(!req.user || !req.user.name || !req.user.id){
		return res.status(401).send({success: false, reason:'You-must-log-in-to-perform-this-action'});
	}
	next();
}

module.exports.userInTournament = function(req, res, next) {
	if(!req.user || !req.user.name || !req.user.id){
		return res.status(401).send({success: false, reason:'You-must-log-in-to-perform-this-action'});
	}
	if(!req.params.tourneySlug) return next();

	tourneyMdl.getTourneyId(req.params.tourneySlug,function(err,tourneyId,seeded){
		if(err) return res.status(500).send({success:false,reason:'internal-server-error'});

		tourneyMdl.getPlayersNamesIds(req.params.tourneySlug,function(err,players){
			if(err) res.status(500).send({success:false,reason:'internal-server-error'});

			var userInTourney;
			var opponent;
			players.forEach(function(p){
				if(p.id === req.user.id){
					userInTourney = true;
				} else {
					opponent = p;
				}
			});
			if(!userInTourney){
				return res.status(403).send({success: false, reason:'Not-authorized. Must-be-in-the-tournament-to-perform-this-action'});
			}

			req.user.tournament = {
				id: tourneyId,
				slug: req.params.tourneySlug,
				seeded: seeded,
				players: players,
				opponent: opponent
			};
			next();
		});
	});
}