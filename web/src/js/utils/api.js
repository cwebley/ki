// var serverActions = require('../actions/server-action-creators');

//TODO config this or something
var host = 'http://localhost:3000'

module.exports = {

  getTournament: function(tourneyName) {
    var xhr= new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var data = JSON.parse(xhr.responseText);

            console.log("DATA: ", data)

            //server action creator
        }
    }

    xhr.open("GET", host + "/tournaments/" + tourneyName, true)
    xhr.overrideMimeType("application/json")
    xhr.send()
  }
}