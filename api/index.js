'use strict';

// everything in this dir is written in es2015+ and needs to be compiled
require('babel/register')({});

var server = require('./app.js');
