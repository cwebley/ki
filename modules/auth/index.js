var crypto = require('crypto'),
    passport = require('passport'),
    BasicStrategy = require('passport-http').BasicStrategy,
	redis = require('../persistence').redis,
    userMdl = require('../users/users-model');

passport.use(new BasicStrategy(function(username, password, done) {
        userMdl.getUserObj(username, function(err, user) {
            if (err) return done(err);
            if (!user) return done(null, false);
            if (user.password != password) return done(null, false);
            return done(null, user);
        });
    })
);

var AuthInterface = {};

AuthInterface.ensureAuthenticated = function(req,res,next){
    if(!req.isAuthenticated()) return res.redirect('/users/login')
    next()
}

module.exports = AuthInterface