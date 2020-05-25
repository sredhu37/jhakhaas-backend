const log4js = require('log4js');
const path = require('path');

const logFile = path.join(__dirname, '../logs/app.log');

log4js.configure({
  // 1 MB max file size
  appenders: {
    file: { type: 'file', filename: logFile, maxLogSize: 1000 },
    console: { type: 'console' },
  },
  categories: { default: { appenders: ['file', 'console'], level: 'debug' } },
});

const logger = log4js.getLogger('Logging: ');
logger.level = 'debug';


// Public functions begin here-----------------
const info = (...msg) => {
  logger.info(...msg);
};

const warn = (...msg) => {
  logger.warn(...msg);
};

const error = (...msg) => {
  logger.error(...msg);
};
// Public functions end here-------------------

module.exports = {
  info,
  warn,
  error,
};
