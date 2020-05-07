const logger = require('./utils/logger');
require('dotenv').config();

const exists = (value) => {
  if (value && value !== 'undefined' && value.trim() !== '') {
    return true;
  }

  return false;
};

if (!(
  exists(process.env.MONGO_URI)
    && exists(process.env.GOOGLE_CLIENT_ID)
    && exists(process.env.GOOGLE_CLIENT_SECRET)
    && exists(process.env.GOOGLE_REDIRECT_URI)
    && exists(process.env.JWT_SECRET)
)) {
  logger.error('Issue with ENV VARIABLES! Please check that they are set properly!');
  process.exit(1);
}

const HOST = process.env.HOST || 'http://127.0.0.1';
const PORT = process.env.PORT || 3000;

module.exports = {
  MONGO_URI: process.env.MONGO_URI,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  HOST,
  PORT,
};
