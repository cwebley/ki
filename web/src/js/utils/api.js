var xhr = require('xhr'),
    serverActions = require('../actions/server-action-creators');

//TODO config this or something
var host = 'http://localhost:3000'

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
                console.log("ERROR")
            }
            serverActions.receiveTournamentIndex(body)
        })
    }
}