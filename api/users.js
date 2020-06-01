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

usersRouter.get('/leaders', verifyAuthToken, async (req, res) => {
  try {
    const top10 = await UserModel
      .find({}, 'email totalScore pictureUrl')
      .sort({ totalScore: 'desc' })
      .limit(10);

    if (utils.exists(top10) && top10.length > 0) {
      res.send(top10);
    } else {
      throw new Error("Couldn't get top scorers from DB!");
    }
  } catch (error) {
    logger.error(`Error: ${error}`);
    res.status(500).send(`Issue in getting top 10 profiles. Please inform Sunny immediately. Error: ${error}`);
  }
});

module.exports = {
  usersRouter,
};
