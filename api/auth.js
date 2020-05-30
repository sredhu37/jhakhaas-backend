const express = require('express');

const authRouter = express.Router();
const passport = require('passport');
const config = require('../utils/config');
require('./helperModules/googleAuth');
const { verifyAuthToken } = require('../utils/verifyToken');

authRouter.get('/isLoggedIn', verifyAuthToken, (req, res) => {
  res.status(200).send(`${req.user.email} is logged in!`);
});

authRouter.get('logout', (req, res) => {
  req.session = null; // destroy session
  req.logOut(); // logout from passport
  res.redirect(config.other.CLIENT_URL_FAILURE);
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
    successRedirect: config.other.CLIENT_URL_SUCCESS,
    failureRedirect: config.other.CLIENT_URL_FAILURE,
  }));

module.exports = {
  authRouter,
};
