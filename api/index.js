'use strict';

// everything in this dir is written in es2015+ and needs to be compiled
require('babel/register')({});


console.log("PROCESS STARTED");
var server = require('./app.js');

server.set('port', process.env.PORT || 3000);

var server = server.listen(server.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port)
});
