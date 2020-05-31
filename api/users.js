const express = require('express');

const usersRouter = express.Router();
const { UserModel } = require('../models/user');
const { verifyAuthToken } = require('../utils/verifyToken');
const utils = require('../utils/commonMethods');
const logger = require('../utils/logger');

usersRouter.get('/profile', verifyAuthToken, async (req, res) => {
  const myId = req.user.id;
  try {
    console.log(`Searching for user with id: ${myId}`);
    const myInfo = await UserModel.findById(myId, 'email totalScore pictureUrl');
    if (utils.exists(myInfo)) {
      const { totalScore, email, pictureUrl } = myInfo;

      const result = {
        email,
        totalScore,
        pictureUrl,
      };

      res.send(result);
    } else {
      throw new Error('User not found in DB!');
    }
  } catch (error) {
    logger.error(`Error: ${error}`);
    res.status(500).send(`Issue in getting user profile: ${error}`);
  }
});

module.exports = {
  usersRouter,
};
