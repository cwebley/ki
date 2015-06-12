var xhr = require('xhr');

var Api = {

	login: function(data, cb) {
		xhr({
			json: data,
			uri: "/api/login",
			method: "post"
		}, function (err, res, body) {
			if(res.statusCode !== 200) {
				//handle error. require login or render some error based on code?
				console.log("NO LOGIN TOKEN RETURNED FROM api/login")
			}
			return cb(res.statusCode,body);
		})
	},
	getTournamentIndex: function(cb) {
		xhr({
			json: true,
			uri: "/api/tournaments"
		}, function (err, res, body) {
			if(res.statusCode !== 200) {
				//handle error
				console.log("ERROR GETTING TOURNEY INDEX")
			}
			return cb(res.statusCode,body)
		})
	},
	getTournamentData: function(slug,cb) {
		xhr({
			json: true,
			uri: "/api/tournaments/" + slug,
			headers: {
				"x-access-token": localStorage.token
			}
		}, function (err, res, body) {
			if(res.statusCode !== 200) {
				//handle error
				console.log("ERROR GETTING DATA FOR " + slug)
			}
			return cb(res.statusCode,body)
		})
	},
	submitGame: function(data,cb) {
		xhr({
			json: data,
			uri: "/api/games",
			method: "post",
			headers: {
				"x-access-token": localStorage.token
			}
		}, function (err, res, body) {
			cb(res.statusCode)
		})
	},
	getPreviousSeeds: function(slug,cb) {
		xhr({
			json: true,
			uri: "/api/users/" + slug + "/previous-seeds",
			method: "get",
			headers: {
				"x-access-token": localStorage.token
			}
		}, function (err, res, body) {
			cb(res.statusCode, body)
		})
	},
	submitSeeds: function(slug,data,cb) {
		xhr({
			json: data,
			uri: "/api/users/" + slug + "/seed",
			method: "post",
			headers: {
				"x-access-token": localStorage.token
			}
		}, function (err, res, body) {
			cb(res.statusCode, body)
		})
	},
	createTournament: function(data,cb) {
		xhr({
			json: data,
			uri: "/api/tournaments",
			method: "post",
			headers: {
				"x-access-token": localStorage.token
			}
		}, function (err, res, body) {
			cb(res.statusCode, body)
		});
	},
	deleteTournament: function(slug,cb) {
		xhr({
			uri: "/api/tournaments/" + slug,
			method: "delete",
			headers: {
				"x-access-token": localStorage.token
			}
		}, function (err, res, body) {
			cb(res.statusCode, body)
		});
	},
	getInspect: function(slug,cb) {
		xhr({
			json:true,
			uri: "/api/tournaments/" + slug + "/pwr/inspect",
			method: "get",
			headers: {
				"x-access-token": localStorage.token
			}
		}, function (err, res, body) {
			cb(res.statusCode, body)
		});
	},
	postInspection: function(slug,cb) {
		xhr({
			json:true,
			uri: "/api/tournaments/" + slug + "/pwr/inspect",
			method: "post",
			headers: {
				"x-access-token": localStorage.token
			}
		}, function (err, res, body) {
			cb(res.statusCode, body)
		});
	}
}

module.exports = Api;