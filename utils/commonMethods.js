const logger = require('./logger');

const exists = (value) => {
  switch (typeof value) {
    case 'string':
      return !!((value && value !== 'undefined' && value.trim() !== ''));
    case 'object':
      return !!((value && value !== 'undefined'));
    default:
      logger.error('exists method in commonMethods file: Type not handled properly!');
      return false;
  }
};

module.exports = {
  exists,
};
