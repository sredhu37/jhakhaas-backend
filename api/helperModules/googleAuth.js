const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const config = require('../../utils/config');
const logger = require('../../utils/logger');
const { UserModel } = require('../../models/user');
const utils = require('../../utils/commonMethods');

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
  // logger.info(`Google profile: ${JSON.stringify(profile)}`);

  UserModel.findOne({ googleId: profile.id })
    .then((user) => {
      if (utils.exists(user)) {
        return new Promise((resolve) => {
          logger.info(`User ${user.email} already exists. Logging in.`);
          resolve(user);
        });
      }
      logger.info('Registering the new user.');

      const userObject = {
        loginSource: 'google',
        googleId: profile.id,
        isEmailVerified: profile.emails[0].verified,
        email: profile.emails[0].value,
        pictureUrl: profile.photos[0].value,
        name: profile.displayName,
      };

      const usr = new UserModel(userObject);

      return usr.save();
    })
    .then((user) => {
      done(null, user);
    })
    .catch((error) => {
      logger.error(error);
      done(error, null);
    });
}));

// Puts user id into the cookie which will be sent to the browser
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Reads the cookie coming from the browser and verifies the user against the same id
passport.deserializeUser(async (id, done) => {
  try {
    const user = await UserModel.findById(id, 'email');
    logger.info('Found the user with id(retrieved from cookie): ', JSON.stringify(user));
    // This sets user property in req object in the route handler
    done(null, user);
  } catch (error) {
    logger.info(`Couldn't find the user with id(retrieved from cookie): ${id}`);
    done(error, null);
  }
});
