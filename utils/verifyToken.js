const jwt = require('jsonwebtoken');
const config = require('../config');

const verifyAuthToken = (req, res, next) => {
  const token = req.header('auth-token');

  if (!token) {
    res.status(401).send('Access Denied');
  }

  try {
    jwt.verify(token, config.JWT_SECRET);
  } catch (error) {
    res.status(400).send('Invalid Token!');
  }

  next();
};

module.exports = {
  verifyAuthToken,
};
