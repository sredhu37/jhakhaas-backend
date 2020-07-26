const express = require('express');

const authRouter = express.Router();
const passport = require('passport');
const config = require('../utils/config');
require('./helperModules/googleAuth');

authRouter.get('/logout', (req, res) => {
  req.session = null; // destroy session
  req.logOut(); // logout from passport
  res.redirect(config.other.CLIENT_URL);
});

// Google Login and Register
authRouter.get(
  '/google/login',
  passport.authenticate(
    'google',
    { scope: ['profile', 'email'] },
  ),
);

// Callback for Google Authentication
authRouter.get('/google/callback',
  passport.authenticate('google', {
    successRedirect: config.other.CLIENT_URL,
    failureRedirect: config.other.CLIENT_URL,
  }));

module.exports = {
  authRouter,
};
