const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const config = require('../../utils/config');
// const logger = require('../../utils/logger');

// Use the GoogleStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Google
//   profile), and invoke a callback with a user object.
passport.use(new GoogleStrategy({
  clientID: config.google.CLIENT_ID,
  clientSecret: config.google.CLIENT_SECRET,
  callbackURL: config.google.REDIRECT_URI,
},
(accessToken, refreshToken, profile, done) => {
  console.log('Profile: ', profile);
  //    User.findOrCreate({ googleId: profile.id }, function (err, user) {
  //      return done(err, user);
  //    });
  return done(null, profile.name);
}));
