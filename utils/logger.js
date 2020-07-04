const log4js = require('log4js');
const path = require('path');

const logFile = path.join(__dirname, '../logs/app.log');

log4js.configure({
  // 10 MB max file size
  appenders: {
    file: { type: 'file', filename: logFile, maxLogSize: 1000000 },
    console: { type: 'console' },
  },
  categories: { default: { appenders: ['file', 'console'], level: 'debug' } },
});

const logger = log4js.getLogger('Logging: ');
logger.level = 'debug';

module.exports = logger;
