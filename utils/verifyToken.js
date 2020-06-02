const utils = require('./commonMethods');

const verifyAuthToken = async (req, res, next) => {
  if (!utils.exists(req.user)) {
    res.status(401).send('Access Denied');
  } else {
    next();
  }
};

module.exports = {
  verifyAuthToken,
};
