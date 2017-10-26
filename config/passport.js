// Importing Passport, strategies, and config
const passport = require('passport'),
  Users = require('../models/users'),
  config = require('./main'),
  JwtStrategy = require('passport-jwt').Strategy,
  ExtractJwt = require('passport-jwt').ExtractJwt,
  LocalStrategy = require('passport-local');

// Setting username field to email rather than username
const localOptions = {
  usernameField: 'email'
};

// Setting up local login strategy
const localLogin = new LocalStrategy(localOptions, (email, password, done) => {
  Users.findOne({ email: email.toLowerCase() }, (err, user) => {
    if (err) { return done(err); }
    if (!user) { return done(null, false, { error: 'Your login details could not be verified. Please try again.' }); }

    user.comparePassword(password, (err, isMatch) => {
      if (err) { return done(err); }
      if (!isMatch) { return done(null, false, { error: 'Your login details could not be verified. Please try again.' }); }

      return done(null, user);
    });
  });
});

const myJWTExtractor = function(req) {
  const token = req.body.token || req.query.token || null;
  return token || null;
};

// Setting JWT strategy options
const jwtOptions = {
  // Telling Passport to check authorization headers for JWT
  jwtFromRequest:  ExtractJwt.fromAuthHeader(),
  secretOrKey: config.secret
  // TO-DO: Add issuer and audience checks
};

// Setting up JWT login strategy
const jwtLogin = new JwtStrategy(jwtOptions, (payload, done) => {
  Users.findById(payload._id, (err, user) => {
    if (err) { return done(err, false); }

    if (user) {
      done(null, user);
    } else {
      done(null, false);
    }
  });
});

passport.use(jwtLogin);
passport.use(localLogin);
