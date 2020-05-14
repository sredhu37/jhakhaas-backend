const express = require('express');

const authRouter = express.Router();
const emailValidator = require('email-validator');
const PasswordValidator = require('password-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const config = require('../utils/config');
const { UserModel } = require('../models/user');


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

// User registration: First time
authRouter.post('/register', (req, res) => {
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
        const jwtToken = jwt.sign({ __id: response.__id }, config.other.JWT_SECRET);
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

// When user is already registered.
authRouter.post('/login', async (req, res) => {
  const { email } = req.body;
  const { password } = req.body;

  try {
    const user = await UserModel.findOne({ email, isActive: true }, '__id passwordHash');
    logger.info('User exists!', user);

    const isPasswordMatching = await bcrypt.compare(password, user.passwordHash);
    if (isPasswordMatching) {
      logger.info(`User ${email} is signed in!`);
      const jwtToken = jwt.sign({ __id: user.__id }, config.other.JWT_SECRET);
      res.header('auth-token', jwtToken).send(jwtToken);
    } else {
      throw new Error('Incorrect password!');
    }
  } catch (error) {
    logger.error(error);
    res.status(401).send('Incorrect username or password!');
  }
});

module.exports = {
  authRouter,
};
