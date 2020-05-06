const express = require('express');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const logger = require('./utils/logger');
const middleware = require('./utils/middleware');
const usersController = require('./controllers/users');
const questionsController = require('./controllers/questions');
const auth = require('./services/auth');

const app = express();
app.use(express.json());
app.use(middleware.logRequest);
app.use('/api/users', usersController.usersRouter);
app.use('/api/questions', questionsController.questionsRouter);
app.use('/auth', auth.authRouter);

const PORT = process.env.PORT || 3000;

const connectToMongoDB = (mongoUri) => {
  mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
    .then(() => {
      logger.info('Successfully connected to MongoDB!');
    })
    .catch((error) => {
      logger.error(error);
    });
};

const { MONGO_URI } = process.env;

if (MONGO_URI && (MONGO_URI !== 'undefined')) {
  connectToMongoDB(MONGO_URI);
} else {
  logger.error('ERROR: Make sure MONGO_URI environment variable is set properly!');
  // process.exit(1);
}


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
