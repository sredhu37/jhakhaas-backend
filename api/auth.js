const express = require('express');

const authRouter = express.Router();
const emailValidator = require('email-validator');
const PasswordValidator = require('password-validator');
const bcrypt = require('bcrypt');
const passport = require('passport');
const logger = require('../utils/logger');
const { UserModel } = require('../models/user');
const config = require('../utils/config');
const utils = require('../utils/commonMethods');
require('./helperModules/googleAuth');
const { verifyAuthToken } = require('../utils/verifyToken');

const createUserObject = (body) => new Promise((resolve, reject) => {
  let isEmailVerified = false;

  if (!(body.loginSource) || body.loginSource === 'local') {
    isEmailVerified = false;
  } else {
    isEmailVerified = true;
  }

  bcrypt.hash(body.password, 10).then((passwordHash) => {
    const obj = {
      passwordHash,
      isEmailVerified,
    };

    const keys = Object.keys(body);

    keys.forEach((key) => {
      obj[key] = body[key];
    });

    delete obj.password;
    logger.info('userObj created: ', obj);
    resolve(obj);
  }).catch((error) => {
    const msg = `Issue in creating HASH for password: ${error}`;
    logger.error(msg);
    reject(msg);
  });
});

const validatePassword = (password) => {
  const schema = new PasswordValidator();

  schema
    .is().min(8) // Minimum length 8
    .is().max(15) // Maximum length 100
    .has()
    .uppercase() // Must have uppercase letters
    .has()
    .lowercase() // Must have lowercase letters
    .has()
    .digits() // Must have digits
    .has()
    .not()
    .spaces(); // Should not have spaces

  return schema.validate(password, { list: true });
};

authRouter.get('/isLoggedIn', verifyAuthToken, (req, res) => {
  res.status(200).send(`${req.user.email} is logged in!`);
});

authRouter.get('logout', (req, res) => {
  req.session = null; // destroy session
  req.logOut();   // logout from passport
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
