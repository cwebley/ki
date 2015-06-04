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
}

module.exports = Api;