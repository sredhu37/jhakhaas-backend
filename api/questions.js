const express = require('express');
// const moment = require('moment');

const questionsRouter = express.Router();
const logger = require('../utils/logger');
const { QuestionModel } = require('../models/question');
const { UserModel } = require('../models/user');
const { verifyAuthToken } = require('../utils/verifyToken');
// const utils = require('../utils/commonMethods');

// const DATE_FORMAT = 'YYYY-MM-DD';
const GENERAL = 'general';

const createNewQuestionsArr = (body) => body.questions.map((que) => ({
  ...que,
  class: body.class,
  subject: body.subject,
  chapter: body.chapter,
  uploader: body.uploader
}));

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

/* Submit user's answer
 * Return status:
 * 200 => Correct Answer
 * 204 => Incorrect Answer
 * 404 => Error
*/
questionsRouter.post('/submit', verifyAuthToken, async (req, res) => {
  // const { body } = req;
  // const questionId = body.question._id;
  // const { usersAnswer } = body;
  // const userId = req.user.id;

  try {
    // Will implement later
    res.send('OK');
  } catch (error) {
    res.status(404).send(error.toString());
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
