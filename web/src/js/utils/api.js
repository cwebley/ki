var xhr = require('xhr');
// var serverActions = require('../actions/server-action-creators');

//TODO config this or something
var host = 'http://localhost:3000'

module.exports = {

  getTournament: function(tourneyName) {
    xhr({
        json:true,
        uri: "/api/tournaments/" + tourneyName,
        headers: {
            "Content-Type": "application/json"
        }
    }, function (err, resp, body) {
        // check resp.statusCode
        console.log("DONE. CODE: ", resp.statusCode, body)
    })
  }
}