const express = require('express');

const questionsRouter = express.Router();
const mongoose = require('mongoose');
const logger = require('../utils/logger');
const { QuestionModel } = require('../models/question');
const { verifyAuthToken } = require('../utils/verifyToken');
const { exists } = require('../utils/commonMethods');

const getCurrentFormattedDate = () => {
  const todaysDate = new Date();
  // year-month-date
  const formattedDate = `${todaysDate.getFullYear()}-${(todaysDate.getMonth()) + 1}-${todaysDate.getDate()}`;

  return formattedDate;
};

const createNewQueryObject = (body) => {
  const obj = {};

  const keys = Object.keys(body);

  keys.forEach((key) => {
    obj[key] = body[key];
  });

  return obj;
};

// Get all questions
questionsRouter.get('/', verifyAuthToken, (req, res) => {
  QuestionModel.find({})
    .then((response) => {
      res.send(response);
    })
    .catch((error) => {
      res.send(error);
    });
});

// Get today's question
questionsRouter.get('/today', verifyAuthToken, (req, res) => {
  const todaysDate = getCurrentFormattedDate();

  QuestionModel.find({ dateAsked: todaysDate }, '_id problemStatement options difficultyLevel')
    .then((response) => {
      res.send(response);
    })
    .catch((error) => {
      res.send(error);
    });
});

// Check if answer is correct
questionsRouter.post('/submit', verifyAuthToken, (req, res) => {
  const { body } = req;
  const { _id } = body.question;
  const { usersAnswer } = body;
  console.log(body);

  QuestionModel.findById(_id, '_id solution')
    .then((response) => {
      console.log('Response: ', response);
      const usersAns = Object.keys(usersAnswer).map((key) => (usersAnswer[key] ? key : ''));
      console.log('usersAns: ', usersAns);

      const actualSolution = response.solution.split('').sort().join('');
      const usersSolution = usersAns.sort().join('');

      console.log('actualSolution: ', actualSolution);
      console.log('usersSolution: ', usersSolution);

      if (actualSolution === usersSolution) {
        res.status(200).send('Correct Answer');
      } else {
        res.status(204).send('Incorrect Answer');
      }
    })
    .catch((error) => {
      res.status(400).send(error);
    });
});

// Get all questions of a particular difficultyLevel
questionsRouter.get('/:difficulty', verifyAuthToken, (req, res) => {
  const difficultyLevel = req.params.difficulty;

  if (exists(difficultyLevel)) {
    QuestionModel.find({ difficultyLevel, isAlreadyAsked: false })
      .then((response) => {
        res.send(response);
      })
      .catch((error) => {
        res.send(error);
      });
  } else {
    const message = 'Difficulty missing from the body. Incorrect request body!';
    res.status(400).send(message);
    logger.error(message);
  }
});

// Add a new question
questionsRouter.post('/', verifyAuthToken, (req, res) => {
  const { body } = req;
  if (body.problemStatement && body.options && body.solution) {
    const questionObject = createNewQueryObject(body);

    const question = new QuestionModel(questionObject);

    question.save()
      .then((response) => {
        logger.info(response);
        res.status(200).send(response);
      })
      .catch((error) => {
        logger.error(error);
        res.send(error);
      });
  } else {
    const message = 'Unable to add new question. Incorrect request body!';
    res.status(400).send(message);
    logger.error(message);
  }
});

// Update a single question using objectId
questionsRouter.put('/:objectId', verifyAuthToken, (req, res) => {
  const { body } = req;
  const objectIdStr = req.params.objectId;
  const objectId = mongoose.Types.ObjectId(objectIdStr);

  const questionObject = createNewQueryObject(body);

  QuestionModel.findByIdAndUpdate(objectId, questionObject, { returnOriginal: false })
    .then((response) => {
    // logger.info(response);
      res.status(200).send(response);
    })
    .catch((error) => {
    // logger.error(error);
      res.send(error);
    });
});

module.exports = {
  questionsRouter,
};
