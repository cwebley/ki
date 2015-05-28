var xhr = require('xhr');

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
            localStorage.token = body.token
        })
    },
    loggedIn: function(){
        return !!localStorage.token
    },
    logout: function (cb) {
        delete localStorage.token;
    }
}