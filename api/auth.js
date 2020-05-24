const express = require('express');

const authRouter = express.Router();
const emailValidator = require('email-validator');
const PasswordValidator = require('password-validator');
const bcrypt = require('bcrypt');
const passport = require('passport');
const logger = require('../utils/logger');
const { UserModel } = require('../models/user');
const utils = require('../utils/commonMethods');
require('./helperModules/googleAuth');

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

authRouter.get('/', (req, res) => {
  res.send('Auth home page!');
});

// Local Register
authRouter.post('/local/register', (req, res) => {
  const isValidEmail = emailValidator.validate(req.body.email);
  const invalidPasswordRules = validatePassword(req.body.password);

  if (!isValidEmail) {
    res.status(401).send('Invalid email!');
  }

  if (invalidPasswordRules.length > 0) {
    res.status(401).send(`Invalid password: ${invalidPasswordRules}`);
  }

  createUserObject(req.body).then((userObj) => {
    const user = new UserModel(userObj);

    user.save()
      .then((response) => {
        const jwtToken = utils.getJWTFromData({ _id: response._id });
        res.header('auth-token', jwtToken).send(jwtToken);
      })
      .catch((error) => {
        const msg = `Couldn't add the user: ${error}`;
        logger.error(msg);
        res.status(401).send(msg);
      });
  }).catch((error) => {
    res.status(500).send('Unknown error in createUserObject method!', error);
  });
});

// Local Login
authRouter.post('/local/login', async (req, res) => {
  const { email } = req.body;
  const { password } = req.body;

  try {
    const user = await UserModel.findOne({ email, isActive: true }, '_id passwordHash');
    logger.info('User exists!', user);

    const isPasswordMatching = await bcrypt.compare(password, user.passwordHash);
    if (isPasswordMatching) {
      logger.info(`User ${email} is signed in!`);
      const jwtToken = utils.getJWTFromData({ _id: user._id });
      res.header('auth-token', jwtToken).send(jwtToken);
    } else {
      throw new Error('Incorrect password!');
    }
  } catch (error) {
    logger.error(error);
    res.status(401).send('Incorrect username or password!');
  }
});

authRouter.get(
  '/google/login',
  passport.authenticate(
    'google',
    { scope: ['profile', 'email'] },
  ),
);

authRouter.get('/google/callback',
  passport.authenticate('google', {
    // successRedirect: '/auth/google/success',
    failureRedirect: '/auth/google/error',
    session: false,
  }),
  (req, res) => {
    const jwtToken = utils.getJWTFromData({ _id: req.user._id });
    res.header('auth-token', jwtToken).send(jwtToken);
  });

authRouter.get('/google/error', (req, res) => {
  res.send('Some error in google authentication! Contact Sunny!');
});

module.exports = {
  authRouter,
};
