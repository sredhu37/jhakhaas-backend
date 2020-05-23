const logger = require('./logger');
const utils = require('./commonMethods');
const { UserModel } = require('../models/user');

const verifyAuthToken = async (req, res, next) => {
  const token = req.header('auth-token');

  if (!utils.exists(token)) {
    res.status(401).send('Access Denied');
  }

  try {
    const decoded = utils.getDataFromJWT(token);
    const user = await UserModel.findById(decoded._id, '_id email');

    if (!utils.exists(user)) {
      throw new Error(`Cannot find user with id ${decoded._id} in DB!`);
    }
  } catch (error) {
    logger.error(error);
    res.status(400).send('Invalid Token!');
  }

  next();
};

module.exports = {
  verifyAuthToken,
};
