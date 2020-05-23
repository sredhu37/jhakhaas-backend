const jwt = require('jsonwebtoken');
const logger = require('./logger');

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

const getDataFromJWT = (token) => jwt.verify(token, 'jhakhaasjwtsecret');

module.exports = {
  exists,
  getDataFromJWT,
};
