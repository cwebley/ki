var tourneyMdl = require('../tournaments/tournaments-model');

var requiresUser = module.exports.requiresUser = function(req, res, next) {
	if(!req.user || !req.user.name || !req.user.id){
		return res.status(401).send({success: false, reason:'You-must-log-in-to-perform-this-action'});
	}
	next();
}

module.exports.userInTournament = function(req, res, next) {
	if(!req.params.tourneySlug) return next();
	requiresUser(req,res,function(){

		tourneyMdl.getTourneyId(req.params.tourneySlug,function(err,tourneyId,seeded){
			if(err) return res.status(500).send({success:false,reason:'internal-server-error'});

			tourneyMdl.getPlayersNamesIds(req.params.tourneySlug,function(err,players){
				if(err) res.status(500).send({success:false,reason:'internal-server-error'});

				var userInTourney;
				players.forEach(function(p,i){
					if(p.id === req.user.id){
						userInTourney = true;
					}
				});
				if(!userInTourney){
					return res.status(403).send({success: false, reason:'Not-authorized. Must-be-in-the-tournament-to-perform-this-action'});
				}
				if(players[1].id === req.user.id){
					// flip players so logged in user is presented first
					players.push(players.splice(0,1)[0]);
				}
				req.tournament = {
					id: tourneyId,
					slug: req.params.tourneySlug,
					seeded: seeded,
					players: players
				};
				next();
			});
		});
	});
}