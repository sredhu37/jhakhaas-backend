'use strict';

const express = require('express');
const moment = require('moment');

const questionsRouter = express.Router();
const logger = require('../utils/logger');
const { QuestionModel } = require('../models/question');
const { verifyAuthToken } = require('../utils/verifyToken');
const { UserModel } = require('../models/user');
const utils = require('../utils/commonMethods');

const DATE_FORMAT = 'YYYY-MM-DD';

// If no date is passed, then return today's date
const getDate = (date = '') => (utils.exists(date)
  ? moment(date).format(DATE_FORMAT)
  : moment().format(DATE_FORMAT));

const createNewQuestionsArr = (body) => body.questions.map((que) => ({
  ...que,
  class: body.class,
  subject: body.subject,
  chapter: body.chapter,
  uploader: body.uploader,
}));

const isAnswerCorrect = (usersAnswer, question) => (usersAnswer.a === question.answer.a
  && usersAnswer.b === question.answer.b
  && usersAnswer.c === question.answer.c
  && usersAnswer.d === question.answer.d);

const getUpdatedQuestionObject = (question, usersAnswer) => {
  let state = 'INCORRECT';

  if (
    !usersAnswer.a
    && !usersAnswer.b
    && !usersAnswer.c
    && !usersAnswer.d
  ) {
    state = 'UNATTEMPTED';
  } else if (isAnswerCorrect(usersAnswer, question)) {
    state = 'CORRECT';
  }

  return {
    _id: question._id,
    optionsSelected: usersAnswer,
    state,
    dateAsked: getDate(),
  };
};

const getUpdatedArray = (arr, indexToUpdate, updatedValue) => arr.map((oldValue, index) => ((index === indexToUpdate) ? updatedValue : oldValue));

/*
 * check that each question has a problem statement
 * check that each question has 4 options
 * check that each question's answer has a value
 * check that an uploader value is present
 * check that a class is selected
 * check that a subject is selected
 * check that a chapter is selected
 * Returns:
 * {
 *    status: <true or false>,
 *    msg: <Err msg if status is false>
 * }
*/
const isUploadQuestionsBodyValid = (body) => {
  const result = { status: true, msg: '' };
  console.log(body);
  if (body.questions && body.questions.length) {
    body.questions.forEach((que) => {
      // check that each question has a problem statement
      if (que.problemStatement.trim() === '') {
        result.status = false;
        result.msg = 'Question is missing the problem statement!';
      }

      // check that each question has 4 options
      if (
        que.options.a.trim() === ''
        || que.options.b.trim() === ''
        || que.options.c.trim() === ''
        || que.options.d.trim() === '') {
        result.status = false;
        result.msg = 'Question is missing some of the options!';
      }

      // check that each question's answer has a value
      if (!(que.answer.a || que.answer.b || que.answer.c || que.answer.d)) {
        result.status = false;
        result.message = 'Question is missing the correct answer!';
      }
    });

    // check that an uploader value is present
    if (body.uploader.trim() === '') {
      result.status = false;
      result.msg = 'There needs to be valid email id for uploader!';
    }

    // check that a class is selected
    if (!body.class) {
      result.status = false;
      result.msg = 'There needs to be some value for class!';
    }

    // check that a subject is selected
    if (body.subject.trim() === '') {
      result.status = false;
      result.msg = 'There needs to be some value for subject!';
    }

    // check that a chapter is selected
    if (body.chapter.trim() === '') {
      result.status = false;
      result.msg = 'There needs to be some value for chapter!';
    }
  } else {
    result.status = false;
    result.msg = 'Unable to add new questions. Incorrect request body!';
  }

  return result;
};

/**
 *  Get ONE question
 *
 *  Acceptable body: {
 *    userId: String,
 *    className: String,
 *    subject: String,
 *    chapter: String,
 *    latestQueId: String, (optional)
 *  }
 *
 *  Return status:
 *  200 => OK
 *  400 => Bad request
 *  500 => Error
*/
questionsRouter.get('/', async (req, res) => {
  const {
    userId, className, subject, chapter,
  } = req.body;

  try {
    if (utils.exists(userId) && utils.exists(className) && utils.exists(subject) && utils.exists(chapter)) {
      const user = await UserModel.findById(userId).populate('questionsAttempted');

      res.send(user);
    } else {
      res.sendStatus(400); // Bad request
    }
  } catch (err) {
    res.status(500).send(err.toString());
  }
});

/**
 * Submit user's answer
 * Acceptable body
 * {
 *    userId: String,
 *    questionId: String,
 *    usersAnswer: {
 *      a: Boolean,
 *      b: Boolean,
 *      c: Boolean,
 *      d: Boolean
 *    }
 * }
 *
 * Return status:
 * 200 => Correct Answer
 * 204 => Incorrect Answer
 * 400 => Bad request
 * 500 => Error
 * */
questionsRouter.post('/submit', async (req, res) => {
  const { body } = req;
  const { userId, questionId, usersAnswer } = body;

  try {
    if (utils.exists(userId) && utils.exists(questionId) && utils.exists(usersAnswer)) {
      // Get user object from DB
      const user = await UserModel.findById(userId);
      const question = await QuestionModel.findById(questionId);

      const newQuestionObject = getUpdatedQuestionObject(question, usersAnswer);

      const isAlreadyAttempted = user.questionsAttempted
        .map((que) => que._id.toString().trim())
        .includes(questionId.toString().trim());

      if (isAlreadyAttempted) {
        const indexToUpdate = user.questionsAttempted.findIndex((que) => que._id.toString().trim() === questionId.toString().trim());

        await UserModel.findByIdAndUpdate({ _id: userId }, {
          questionsAttempted: getUpdatedArray(user.questionsAttempted, indexToUpdate, newQuestionObject),
        });
      } else {
        await UserModel.findByIdAndUpdate({ _id: userId }, {
          questionsAttempted: [
            ...user.questionsAttempted,
            newQuestionObject,
          ],
        });
      }

      if (isAnswerCorrect(usersAnswer, question)) {
        res.sendStatus(200);
      } else {
        res.sendStatus(204);
      }
    } else {
      res.sendStatus(400); // Bad request
    }
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

/* Add new questions
 * Acceptable Body format:
 * {
 *    questions: [
 *      {
 *        problemStatement: String,
 *        options: {
 *          a: String,
 *          b: String,
 *          c: String,
 *          d: String,
 *        },
 *        answer: {
 *          a: Boolean,
 *          b: Boolean,
 *          c: Boolean,
 *          d: Boolean,
 *        },
 *      }
 *    ],
 *    class: String,
 *    subject: String,
 *    chapter: String
 *    uploader: String
 * }
*/
questionsRouter.post('/upload', verifyAuthToken, async (req, res) => {
  const { body } = req;

  try {
    const { status, msg } = isUploadQuestionsBodyValid(body);
    if (status) {
      const questions = createNewQuestionsArr(body);
      logger.info('Questions to upload: ', questions);

      const result = await QuestionModel.insertMany(questions);
      logger.info('Questions uploaded successfully: ', result);
      res.send('Questions uploaded successfully!');
    } else {
      throw new Error(msg);
    }
  } catch (err) {
    logger.error(err);
    res.status(400).send(err);
  }
});


module.exports = {
  questionsRouter,
};
