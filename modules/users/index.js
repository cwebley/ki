var _ = require('lodash'),
	async = require('async'),
	constants = require('../constants'),
	usersSvc = require('./users-service'),
	usersMdl = require('./users-model'),
	tournamentsMdl = require('../tournaments/tournaments-model'),
	auth = require('../auth'),
	mysql = require('../persistence').mysql;

var UsersInterface = {};

var userListDto = function(data){
	if(!data || !data.length) data = [];
	return {users:data}
}

var loginDto = function(username,uid,seedData){
	var dto = {
		user: {
			username:username,
			userId: uid
		}
	}
	if(seedData && seedData.length){
		dto.seeded={}
		for(var i=0;i<seedData.length;i++){
			if(seedData[i].seeded){
				dto.seeded[seedData[i].name] = true
			}
		}
	}

	return dto
}


var previousSeedDto = function(tourneyInfo, seeds, stats, username){

	for(var i=0; i<stats.length; i++){
		if(username === stats[i].name){
			//make sure your data comes first
			stats.unshift(stats.pop());
		}
	}
	return {
		seeds: seeds,
		stats: {
			info: tourneyInfo,
			users: stats
		}
	};
}

UsersInterface.register = function(options, cb) {
	usersSvc.registerUser(options,function(err,userId){
		if(err) return cb(err)
		return cb(null,loginDto(options.username,userId))
	})
};

UsersInterface.login = function(options, cb) {
	usersSvc.login(options,function(err,seedStatus,uid){
		if(err)return cb(err)
		if(!seedStatus) return cb()
		var dto = loginDto(options.username,uid,seedStatus)
			return cb(err, dto)
	});
};

UsersInterface.seedCharacters = function(options, cb) {
	usersSvc.seedCharacters(options, cb)
};

UsersInterface.getUserList = function(creatorsName, cb) {
	usersMdl.getUserList(creatorsName, function(err,results){
		if(err)return cb(err)
		return cb(null,userListDto(results))
	});
};

UsersInterface.getOpponentsNames = function(seederName,tourneyName,cb) {
	usersMdl.getOpponentsNames(seederName,tourneyName, function(err,results){
		if(err)return cb(err)
		return cb(null,userListDto(results))
	});
};

UsersInterface.verifySeeds = function(seeds) {
	var c = constants.characters;
	var possibleValues = [];

	// make sure all characters accounted for
	for(var i=0;i<c.length;i++){
		if(!seeds[c[i]]){
			return false
		}
		possibleValues.push(Math.round((i+1)/2)) // 2 of each number is accepted (except highest value)
	}

	// make sure all in possibleValues are accounted for
	for(var s in seeds){
		var valueIndex = possibleValues.indexOf(parseInt(seeds[s]))
		if(valueIndex === -1){
			return false
		}
		possibleValues.splice(valueIndex,1)
	}
	return true
};

UsersInterface.getPreviousSeeds = function(tourneySlug, username, cb) {
	tournamentsMdl.getTourneyId(tourneySlug,function(err,tid){
		if(err) return cb(err);
		if(!tid) return cb();

		usersMdl.getOpponentId(username,function(err,oid){
			if(err) return cb(err);
			if(!oid) return cb();

			//get previous tournament info
			tournamentsMdl.getPrevious(tid,function(err, prevRes){
				if(err) return cb(err);
				prevTid = prevRes.id

				tournamentsMdl.getSeeds(prevTid,oid,function(err, seedRes){
					if(err) return cb(err);
					if(!seedRes) return cb();

					tournamentsMdl.getStats(prevRes.slug, function(err,stats){
						if(err) return cb(err);
						if(!stats) return cb();

						return cb(null, previousSeedDto(prevRes,seedRes,stats,username))
					})
				});
			});
		});
	});
};

module.exports = UsersInterface;
