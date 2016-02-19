'use strict';

// everything in this dir is written in es2015+ and needs to be compiled
require('babel/register')({});


console.log("PROCESS STARTED");
var server = require('./app.js');
