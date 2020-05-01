const logger = require('./logger');

const logRequest = (req, res, next) => {
  logger.info('---Request begins here---');
  logger.info('Method:', req.method);
  logger.info('Path:  ', req.path);
  logger.info('Body:  ', req.body);
  logger.info('---Request ends here---');
  next();
};

module.exports = {
  logRequest,
};
