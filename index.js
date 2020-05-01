const express = require('express');
const fs = require('fs');
const path = require('path');

const logger = require('./utils/logger');
const middleware = require('./utils/middleware');
const usersController = require('./controllers/users');

const app = express();
app.use(middleware.logRequest);
app.use('/api/users', usersController.usersRouter);

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({ msg: 'This page seems to be working fine :)' });
});

app.get('/logs', (req, res) => {
  const logFilePath = path.join(__dirname, './logs/app.log');
  const stat = fs.statSync(logFilePath);

  res.writeHead(200, {
    'Content-Type': 'text/plain',
    'Content-Length': stat.size,
  });

  const readStream = fs.createReadStream(logFilePath);
  // We replaced all the event handlers with a simple call to readStream.pipe()
  readStream.pipe(res);
});

app.listen(PORT, () => {
  logger.info('Listening on http://127.0.0.1:3000');
});
