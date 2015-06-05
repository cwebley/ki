// var passport = require('passport'),
//     BasicStrategy = require('passport-http').BasicStrategy,
// 	redis = require('../persistence').redis,
var express = require('express'),
    jwt = require('jwt-simple'),
    userMdl = require('../users/users-model'),
    moment = require('moment'),
    app = express();

app.set('jwtTokenSecret', 'secret-secret-secret');

/*
    Example Token:

    {
        iss: <user-id>,
        exp: 129481765981,
        username: <username>
    }
*/

var AuthInterface = {};

// options = {username: 'foo', password: 'bar'}
AuthInterface.authenticate = function(options,cb){
    userMdl.getUserObj(options.username, function(err, user) {
        if (err) return cb(err);
        if (!user || user.password !== options.password) return cb();

        //user found, generate and return jwt token.
        var expires = moment().add(3, 'days').valueOf(); // token valid for 3 days
        var token = jwt.encode({
            iss:user.id,
            exp: expires,
            username: user.name
        }, app.get('jwtTokenSecret'));

        return cb(null,token)
    });
};

// options = {username: 'foo', password: 'bar', email: foo@bar.baz, }
AuthInterface.register = function(options,cb){
    userMdl.createUser(options.username, options.password, options.email, function(err, results) {
        if (err) return cb(err);
        if(!results || !results.insertId) return cb();

        //user found, generate and return jwt token.
        var expires = moment().add(3, 'days').valueOf(); // token valid for 3 days
        var token = jwt.encode({
            iss:results.insertId,
            exp: expires,
            username: options.username
        }, app.get('jwtTokenSecret'));

        return cb(null,token);
    });
};

AuthInterface.verifyToken = function(req,res,next){
    var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];
    if(!token) return next();

    try {
        var decoded = jwt.decode(token, app.get('jwtTokenSecret'));
        if (decoded.exp <= Date.now()) {
            return res.status(400).send({reason:'access_token-expired'});
        }
        userMdl.getUserById(decoded.iss,function(err,user){
            if(err) return res.status(500).send({reason:'error-finding-user',err:err});
            if(!user) return res.status(401).send({reason:'user-in-token-not-found'});
            req.user = user;
            next();
        });
    } catch (err) {
        return res.status(401).send({reason:'error-decoding-access_token'});
    }
};

AuthInterface.ensureAuthenticated = function(req,res,next){
    if(!req.user) return res.status(401).send({reason:'unauthorized-please-login'})
    next();
};


module.exports = AuthInterface;