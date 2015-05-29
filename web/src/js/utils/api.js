var xhr = require('xhr'),
    serverActions = require('../actions/server-action-creators');

    module.exports = {

    login: function(data) {
        xhr({
            json: data,
            uri: "/api/login",
            method: "post"
        }, function (err, resp, body) {
            if(resp.statusCode !== 200) {
                //handle error. require login or render some error based on code?
                console.log("NO LOGIN TOKEN RETURNED FROM api/login")
            }
            serverActions.receiveLoginToken(body);
        })
    },
    getTournamentIndex: function() {
        xhr({
            json: true,
            uri: "/api/tournaments"
        }, function (err, resp, body) {
            if(resp.statusCode !== 200) {
                //handle error
                console.log("ERROR GETTING TOURNEY INDEX")
            }
            serverActions.receiveTournamentIndex(body)
        })
    },
    getTournamentData: function(title) {
        xhr({
            json: true,
            uri: "/api/tournaments/" + title,
            headers: {
                "x-access-token": localStorage.token
            }
        }, function (err, resp, body) {
            if(resp.statusCode !== 200) {
                //handle error
                console.log("ERROR GETTING DATA FOR " + title)
            }
            serverActions.receiveTournamentData(body)
        })
    }
}