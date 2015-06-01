var xhr = require('xhr');

var Api = {

	login: function(data, cb) {
		xhr({
			json: data,
			uri: "/api/login",
			method: "post"
		}, function (err, resp, body) {
			if(resp.statusCode !== 200) {
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
		}, function (err, resp, body) {
			if(resp.statusCode !== 200) {
				//handle error
				console.log("ERROR GETTING TOURNEY INDEX")
			}
			return cb(resp.statusCode,body)
		})
	},
	getTournamentData: function(slug,cb) {
		xhr({
			json: true,
			uri: "/api/tournaments/" + slug,
			headers: {
				"x-access-token": localStorage.token
			}
		}, function (err, resp, body) {
			if(resp.statusCode !== 200) {
				//handle error
				console.log("ERROR GETTING DATA FOR " + slug)
			}
			return cb(resp.statusCode,body)
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
		}, function (err, resp, body) {
			cb(resp.statusCode)
		})
	},
}

module.exports = Api;