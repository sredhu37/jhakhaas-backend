const express = require('express');

const questionsRouter = express.Router();
const mongoose = require('mongoose');
const logger = require('../utils/logger');
const { QuestionModel } = require('../models/question');
const { UserModel } = require('../models/user');
const { verifyAuthToken } = require('../utils/verifyToken');
const utils = require('../utils/commonMethods');

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

const getUsersAnswerString = (usersAnswer) => {
  const usersAns = Object.keys(usersAnswer).map((key) => (usersAnswer[key] ? key : ''));
  const usersSolution = usersAns.sort().join('');

  return usersSolution;
};

const isUsersAnswerCorrect = async (_id, usersAnswerString) => new Promise(async (resolve, reject) => {
  try {
    const question = await QuestionModel.findById(_id, '_id solution');
    const actualAnswerString = question.solution.split('').sort().join('');

    if (actualAnswerString === usersAnswerString) {
      resolve(true);
    } else {
      resolve(false);
    }
  } catch (error) {
    reject(error);
  }
});

const updateUsersResponseInDB = async (isAnswerCorrect, userId, questionId, usersAnswerString) => new Promise(async (resolve, reject) => {
  try {
    const user = await UserModel.findById(userId, '_id questionsAttempted totalScore', { new: true });
    const valuesToUpdate = {};

    let { questionsAttempted, totalScore } = user;
    const questionToUpdate = questionsAttempted.find((ques) => (questionId.localeCompare(ques._id) === 0));

    // update questionsAttempted
    if (utils.exists(questionToUpdate)) {
      // this question is already attempted
      // first attempt to this question
      const questionIndex = questionsAttempted.findIndex((ques) => ques._id === questionId);

      // No more than 3 tries allowed
      if (questionToUpdate.triesCount >= 3) {
        logger.info('Sorry! You cannot try more than 3 times.');
        resolve(false);
        return;
      }
      // Increment tries count and score
      questionToUpdate._id = questionId;
      questionToUpdate.optionsSelected = usersAnswerString;
      questionToUpdate.triesCount += 1;

      if(questionToUpdate.score === 0 && isAnswerCorrect) {
        questionToUpdate.score = 1;
        totalScore++;
      }

      questionsAttempted.splice(questionIndex, 1);
      questionsAttempted.push(questionToUpdate);
    } else {
      const questionToAdd = {};
      questionToAdd._id = questionId;
      questionToAdd.optionsSelected = usersAnswerString;
      questionToAdd.triesCount = 1;

      if(isAnswerCorrect) {
        questionToAdd.score = 1;
        totalScore++;
      }

      questionsAttempted.push(questionToAdd);
    }

    valuesToUpdate.questionsAttempted = questionsAttempted;
    valuesToUpdate.totalScore = totalScore;

    await UserModel.findOneAndUpdate({ _id: userId }, valuesToUpdate, { new: true });

    resolve(true);
  } catch (error) {
    reject(error);
  }
});

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

// Submit user's answer
// Return status:
// 200 => Correct Answer
// 204 => Incorrect Answer
// 208 => Number of tries > 3
// 404 => Error
questionsRouter.post('/submit', verifyAuthToken, async (req, res) => {
  const { body } = req;
  const questionId = body.question._id;
  const { usersAnswer } = body;
  const userId = req.user.id;

  const usersAnswerString = getUsersAnswerString(usersAnswer);

  try {
    const isAnswerCorrect = await isUsersAnswerCorrect(questionId, usersAnswerString);

    const updateDbResult = await updateUsersResponseInDB(isAnswerCorrect, userId, questionId, usersAnswerString);

    if (updateDbResult) {
      if (isAnswerCorrect) {
        res.status(200).send('Correct answer');
      } else {
        res.status(204).send('Incorrect answer');
      }
    } else {
      res.status(208).send('Sorry! You cannot try more than 3 times.');
    }
  } catch (error) {
    logger.error(error);
    res.status(404).send(error);
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
