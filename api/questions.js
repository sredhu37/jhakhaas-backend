const express = require('express');

const questionsRouter = express.Router();
const mongoose = require('mongoose');
const logger = require('../utils/logger');
const { QuestionModel } = require('../models/question');
const { verifyAuthToken } = require('../utils/verifyToken');

const createNewQueryObject = (body) => {
  const obj = {
    dateAsked: new Date(),
  };

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

// Get all questions of a particular difficultyLevel
questionsRouter.get('/:difficulty', verifyAuthToken, (req, res) => {
  const difficultyLevel = req.params.difficulty;

  if (difficultyLevel && difficultyLevel !== 'undefined') {
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
