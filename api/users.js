const express = require('express');

const usersRouter = express.Router();
const logger = require('../utils/logger');
const { UserModel } = require('../models/user');
const { verifyAuthToken } = require('../utils/verifyToken');
const { validatePassword, validateEmail, createNewUser } = require('./helperModules/usersUtils');

usersRouter.get('/', verifyAuthToken, (req, res) => {
  UserModel.find({})
    .then((response) => {
      res.send(response);
    })
    .catch((error) => {
      res.send(error);
    });
});

usersRouter.get('/:id', verifyAuthToken, (req, res) => {
  const { id } = req.params;

  if (id && id !== 'undefined') {
    UserModel.find({ __id: id })
      .then((response) => {
        res.send(response);
      })
      .catch((error) => {
        res.send(error);
      });
  } else {
    const message = 'ID missing from the body. Incorrect request body!';
    res.status(400).send(message);
    logger.error(message);
  }
});

usersRouter.post('/', verifyAuthToken, (req, res) => {
  const { body } = req;
  if (body.email && body.password) {
    Promise.all([
      validatePassword(body.password),
      validateEmail(body.email),
    ])
      .then((response) => {
        logger.info(response);
        const [passwordHash, email] = response;

        const userObject = createNewUser({}, email, passwordHash);

        const user = new UserModel(userObject);

        return user.save();
      })
      .then((response) => {
        logger.info(response);
        res.status(200).send(response);
      })
      .catch((error) => {
        logger.error(error);
        res.status(401).send(`Couldn't add the user: ${error}`);
      });
  } else {
    const message = 'Unable to add new user. Incorrect request body!';
    logger.error(message);
    res.status(400).send(message);
  }
});

module.exports = {
  usersRouter,
};
