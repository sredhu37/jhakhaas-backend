require('dotenv').config();
const logger = require('./logger');
const { exists } = require('./commonMethods');

const resultObj = {};

const NODE_ENV = exists(process.env.NODE_ENV) ? process.env.NODE_ENV : 'PROD';

if (NODE_ENV === 'DEV') {
  if (exists(process.env.MONGO_URI_DEV)) {
    const mongoObj = { URI: process.env.MONGO_URI_DEV };
    resultObj.mongo = mongoObj;
  } else {
    logger.error('Issue with MONGO env vars! Please inform Administrator immediately!');
    process.exit(1);
  }

  if (
    exists(process.env.GOOGLE_CLIENT_ID_DEV)
    && exists(process.env.GOOGLE_CLIENT_SECRET_DEV)
    && exists(process.env.GOOGLE_REDIRECT_URI_DEV)
  ) {
    const googleObj = {
      CLIENT_ID: process.env.GOOGLE_CLIENT_ID_DEV,
      CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET_DEV,
      REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI_DEV,
    };

    resultObj.google = googleObj;
  } else {
    logger.error('Issue with GOOGLE env vars! Please inform Administrator immediately!');
    process.exit(1);
  }

  const otherObj = {
    HOST: process.env.HOST_DEV || 'http://127.0.0.1',
    PORT: process.env.PORT_DEV || 3000,
    CLIENT_URL: process.env.CLIENT_URL_DEV,
  };

  resultObj.other = otherObj;
} else if (NODE_ENV === 'PROD') {
  if (exists(process.env.MONGO_URI_PROD)) {
    const mongoObj = { URI: process.env.MONGO_URI_PROD };
    resultObj.mongo = mongoObj;
  } else {
    logger.error('Issue with MONGO env vars! Please inform Administrator immediately!');
    process.exit(1);
  }

  if (
    exists(process.env.GOOGLE_CLIENT_ID_PROD)
    && exists(process.env.GOOGLE_CLIENT_SECRET_PROD)
    && exists(process.env.GOOGLE_REDIRECT_URI_PROD)
  ) {
    const googleObj = {
      CLIENT_ID: process.env.GOOGLE_CLIENT_ID_PROD,
      CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET_PROD,
      REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI_PROD,
    };

    resultObj.google = googleObj;
  } else {
    logger.error('Issue with GOOGLE env vars! Please inform Administrator immediately!');
    process.exit(1);
  }

  const otherObj = {
    HOST: process.env.HOST_PROD || 'http://127.0.0.1',
    PORT: process.env.PORT_PROD || process.env.PORT || 3000,
    CLIENT_URL: process.env.CLIENT_URL_PROD,
  };

  resultObj.other = otherObj;
}

module.exports = resultObj;
