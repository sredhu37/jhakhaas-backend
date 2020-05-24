const jwt = require('jsonwebtoken');
const logger = require('./logger');

const JWT_SECRET = 'jhakhaasjwtsecret';

const exists = (value) => {
  switch (typeof value) {
    case 'string':
      return !!((value && value !== 'undefined' && value.trim() !== ''));
    case 'object':
      return !!((value && value !== 'undefined'));
    case 'undefined':
      return false;
    default:
      logger.error(`exists method in commonMethods file: Type ${typeof value} not handled properly!`);
      return false;
  }
};

const getDataFromJWT = (token) => jwt.verify(token, JWT_SECRET);

const getJWTFromData = (data) => jwt.sign(data, JWT_SECRET);

module.exports = {
  exists,
  getDataFromJWT,
  getJWTFromData,
};
