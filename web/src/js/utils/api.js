var xhr = require('xhr'),
    serverActions = require('../actions/server-action-creators');

//TODO config this or something
var host = 'http://localhost:3000'

module.exports = {

  getTournamentIndex: function() {
    xhr({
        json: true,
        uri: "/api/tournaments",
        headers: {
            "Content-Type": "application/json"
        }
    }, function (err, resp, body) {
        if(resp.statusCode !== 200) {
            //handle error
            console.log("ERROR")
        }
        console.log("BODY: ", body)
        // serverActions.receiveTourneyData(body)
    })
  }
}