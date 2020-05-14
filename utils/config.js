const logger = require('./logger');
require('dotenv').config();

const resultObj = {};

const exists = (value) => {
  if (value && value !== 'undefined' && value.trim() !== '') {
    return true;
  }

  return false;
};

if (exists(process.env.MONGO_URI)) {
  const mongoObj = { URI: process.env.MONGO_URI };
  resultObj.mongo = mongoObj;
} else {
  logger.error('Issue with MONGO env vars! Please inform Sunny immediately!');
  process.exit(1);
}

if (
  exists(process.env.GOOGLE_CLIENT_ID)
  && exists(process.env.GOOGLE_CLIENT_SECRET)
  && exists(process.env.GOOGLE_REDIRECT_URI)
) {
  const googleObj = {
    CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
  };

  resultObj.google = googleObj;
} else {
  logger.error('Issue with GOOGLE env vars! Please inform Sunny immediately!');
  process.exit(1);
}

if (exists(process.env.JWT_SECRET)) {
  const otherObj = {
    JWT_SECRET: process.env.JWT_SECRET,
    HOST: process.env.HOST || 'http://127.0.0.1',
    PORT: process.env.PORT || 3000,
  };

  resultObj.other = otherObj;
} else {
  logger.error('Issue with OTHER env var! Please inform Sunny immediately!');
  process.exit(1);
}

module.exports = resultObj;
