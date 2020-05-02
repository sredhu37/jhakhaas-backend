const express = require('express');

const usersRouter = express.Router();
const phone = require('phone');
const emailValidator = require('email-validator');
const bcrypt = require('bcrypt');
const logger = require('../utils/logger');
const { UserModel } = require('../models/user');

const validatePassword = (password) => {
  const bcryptSaltRounds = 10;
  return bcrypt.hash(password, bcryptSaltRounds);
};

const validatePhone = (phoneNum) => new Promise((resolve, reject) => {
  const isPhoneValid = phone(phoneNum, 'IND');

  if (isPhoneValid) {
    resolve(phoneNum);
  } else {
    reject(new Error('Error: Invalid phone number'));
  }
});

const validateEmail = (emailId) => new Promise((resolve, reject) => {
  const isValid = emailValidator.validate(emailId);
  if (isValid) {
    resolve(emailId);
  } else {
    reject(new Error('Invalid email'));
  }
});

const createNewQueryObject = (body, email, phoneNumber, passwordHash) => {
  const obj = {
    email,
    phoneNumber,
    passwordHash,
  };

  const keys = Object.keys(body);

  keys.forEach((key) => {
    obj[key] = body[key];
  });

  return obj;
};

usersRouter.get('/', (req, res) => {
  UserModel.find({})
    .then((response) => {
      res.send(response);
    })
    .catch((error) => {
      res.send(error);
    });
});

usersRouter.get('/:phone', (req, res) => {
  const phoneNumber = req.params.phone;

  if (phoneNumber && phoneNumber !== 'undefined') {
    UserModel.find({ phoneNumber })
      .then((response) => {
        res.send(response);
      })
      .catch((error) => {
        res.send(error);
      });
  } else {
    const message = 'Phone number missing from the body. Incorrect request body!';
    res.status(400).send(message);
    logger.error(message);
  }
});

usersRouter.post('/', (req, res) => {
  const { body } = req;
  if (body.email && body.phone && body.password) {
    Promise.all([
      validatePassword(body.password),
      validateEmail(body.email),
      validatePhone(body.phone),
    ])
      .then((response) => {
        logger.info(response);
        const [passwordHash, email, phoneNumber] = response;
        logger.info(phoneNumber);

        const userObject = createNewQueryObject(body, email, phoneNumber, passwordHash);

        const user = new UserModel(userObject);

        return user.save();
      })
      .then((response) => {
        logger.info(response);
        res.status(200).send(response);
      })
      .catch((error) => {
        logger.error(error);
      });
  } else {
    const message = 'Unable to add new user. Incorrect request body!';
    res.status(400).send(message);
    logger.error(message);
  }
});

module.exports = {
  usersRouter,
};
