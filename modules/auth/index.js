var crypto = require('crypto'),
    passport = require('passport'),
    BasicStrategy = require('passport-http').BasicStrategy,
	redis = require('../persistence').redis,
    userMdl = require('../users/users-model');

var AuthInterface = {};


// passport.serializeUser(function(user, done) {
//     done(null, user.id);
// });

// passport.deserializeUser(function(id, done) {
//     User.findById(id, function (err, user) {
//       done(err, user);
//     });
// });

passport.use(new BasicStrategy(function(username, password, done) {
        console.log('passport basic', username, password)
        userMdl.getUserObj(username, function(err, user) {
            console.log("user: ", user)
            if (err) return done(err);
            console.log(1, err)
            if (!user) return done(null, false);
            console.log(2)
            if (user.password != password) return done(null, false);
            console.log(3)
            return done(null, user);
        });
    })
);

AuthInterface.initializePassport = function(res,req,next){
    console.log("PPORT INIT")
    passport.initialize()
    next()
    console.log("PINIT DONE")
}

AuthInterface.authRequired = function(res,req,next){
    console.log("AUTH REQ")
    passport.authenticate('basic', { session: false }),
    next()/*,
    function(req, res){
        res.json({ username: req.user.username, email: req.user.email });
    }
*/};

AuthInterface.ensureAuthenticated = function(req,res,next){
    if(!req.isAuthenticated()) return res.redirect('/users/login')
    next()
}


//////////////////////////////////////////////////////////
var TOKEN_LENGTH = 32;
var TIME_TO_LIVE = 24*60*60 //1 day
 
AuthInterface.createToken = function(cb) {
    crypto.randomBytes(TOKEN_LENGTH, function(ex, token) {
        if (ex) cb(ex);
 
        if (token) return cb(null, token.toString('hex'));
        return cb(new Error('Problem when generating token'));
    });
};

AuthInterface.setTokenWithData = function(token, data, cb) { 
    var userData = data || {};
    userData._ts = new Date();

    var conn = redis.get('persistent', 'rw'); 
    conn.setex(token, TIME_TO_LIVE, JSON.stringify(userData), function(err, reply) {
        return cb(err,reply)
    });
};

// middleware
AuthInterface.verifyToken = function(req, res, next) {
    var headers = req.headers;
    if (!headers) return res.send(401);
 
    var token = AuthInterface.extractTokenFromHeader(headers,function(err,token){
        if (err) return res.send(401);    	

		AuthInterface.getDataByToken(token, function(err, data) {
           if (err) return res.send(401);
    
           req.session.user = data;
           next();
       });
    });
};


AuthInterface.extractTokenFromHeader = function(headers,cb) {
    if (!headers.authorization) return cb(new Error('no-auth-header'))
 
    var authorization = headers.authorization;
    var authArr = authorization.split(' ');
    if (authArr.length != 2) return cb(new Error('Authorization header value is not of length 2'))
 
    var token = authArr[1];
    if (token.length != TOKEN_LENGTH * 2) return cb(new Error('Token length is not the expected one'))
 
    return token;
};
 
AuthInterface.getDataByToken = function(token, cb) {
	var conn = redis.get('persistent', 'rw'); 
    conn.get(token, function(err, userData) {
        if (err) return cb(err);
        return cb(null, JSON.parse(userData));
    });
};

AuthInterface.expireToken = function(headers, cb) {
    if (!headers) cb(new Error('No-headers'));

    // Get token
    var token = AuthInterface.extractTokenFromHeader(headers,function(err, token){

    	if (!token) return cb(new Error('no-token-found'));
    	var conn = redis.get('persistent', 'rw'); 
    	conn.del(token,cb)
    });
}

AuthInterface.createAndSetToken = function(data,cb) {
    AuthInterface.createToken(function(err,token){
    	if(err) return cb(err)
    	AuthInterface.setTokenWithData(token,data,cb)
    })
};

module.exports = AuthInterface