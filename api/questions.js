const express = require('express');
const moment = require('moment');

const questionsRouter = express.Router();
const logger = require('../utils/logger');
const { QuestionModel } = require('../models/question');
const { UserModel } = require('../models/user');
const { verifyAuthToken } = require('../utils/verifyToken');
const utils = require('../utils/commonMethods');

const DATE_FORMAT = 'YYYY-MM-DD';

const createNewQueryObject = (body) => {
  const obj = {};

  const keys = Object.keys(body);

  keys.forEach((key) => {
    obj[key] = body[key];
  });

  return obj;
};

const isUsersAnswerCorrect = async (_id, usersAnswer) => new Promise(async (resolve, reject) => {
  try {
    const question = await QuestionModel.findById(_id, '_id answer');

    if (
      question.answer.a === usersAnswer.a
      && question.answer.b === usersAnswer.b
      && question.answer.c === usersAnswer.c
      && question.answer.d === usersAnswer.d
    ) {
      resolve(true);
    } else {
      resolve(false);
    }
  } catch (error) {
    reject(error);
  }
});

const updateUsersResponseInDB = async (isAnswerCorrect, userId, questionId, usersAnswer) => new Promise(async (resolve, reject) => {
  try {
    const user = await UserModel.findById(userId, '_id questionsAttempted totalScore', { new: true });
    const valuesToUpdate = {};

    const { questionsAttempted } = user;
    let { totalScore } = user;
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
      questionToUpdate.optionsSelected = usersAnswer;
      questionToUpdate.triesCount += 1;

      if (questionToUpdate.score === 0 && isAnswerCorrect) {
        questionToUpdate.score = 1;
        totalScore += 1;
      }

      questionsAttempted.splice(questionIndex, 1);
      questionsAttempted.push(questionToUpdate);
    } else {
      const questionToAdd = {};
      questionToAdd._id = questionId;
      questionToAdd.optionsSelected = usersAnswer;
      questionToAdd.triesCount = 1;

      if (isAnswerCorrect) {
        questionToAdd.score = 1;
        totalScore += 1;
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

/* check if there are five questions
 * check that each question has a number
 * check that each question has a problem statement
 * check that each question has 4 options
 * check that each question's answer has a value
 * check that a date is selected which is not in past
 * check that a class is selected
 * check that a subject is selected
 * Returns:
 * {
 *    status: <true or false>,
 *    msg: <Err msg if status is false>
 * }
*/
const isPostFiveQuestionsBodyValid = (body) => {
  const result = { status: true, msg: 'Body looks good' };

  // check if there are five questions
  if (body.questions && body.questions.length === 5) {
    body.questions.forEach((que) => {
      // check that each question has a number
      if (!(que.number) || que.number < 1 || que.number > 5) {
        result.status = false;
        result.msg = 'Question is missing the question number!';
      }

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

    // check that a date is selected which is not in past
    if (body.date) {
      const currentDate = moment().format(DATE_FORMAT);
      const selectedDate = moment(body.date).format(DATE_FORMAT);

      if (currentDate > selectedDate) {
        result.status = false;
        result.msg = 'Make sure that you are selecting a date in the future!';
      }
    }

    // check that a class is selected
    if (!body.class) {
      result.status = false;
      result.msg = 'There needs to be some value for class!';
    }

    if (body.subject.trim() === '') {
      result.status = false;
      result.msg = 'There needs to be some value for subject!';
    }
  } else {
    result.status = false;
    result.msg = 'Unable to add new questions. Incorrect request body! Also, make sure to add exactly 5 questions!';
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

// Get today's questions
questionsRouter.get('/today', verifyAuthToken, async (req, res) => {
  try {
    const todaysDate = moment().format(DATE_FORMAT);

    if (req.query && req.query.selectedClass && req.query.selectedSubject) {
      const { selectedClass, selectedSubject } = req.query;

      const response = await QuestionModel.find({ date: todaysDate, class: selectedClass, subject: selectedSubject }, '_id number problemStatement options difficultyLevel');

      if (response.length) {
        res.send(response);
      } else {
        throw new Error(`No question available for class: ${selectedClass} subject: ${selectedSubject} date: ${todaysDate}. Please select some other class or subject! Or contact the administrator!`);
      }
    } else {
      const msg = 'Please send class and subject as parameters!';
      logger.error(msg);
      throw new Error(msg);
    }
  } catch (error) {
    logger.error(error.toString());
    res.status(400).send(error.toString());
  }
});

/* Submit user's answer
 * Return status:
 * 200 => Correct Answer
 * 204 => Incorrect Answer
 * 208 => Number of tries > 3
 * 404 => Error
*/
questionsRouter.post('/submit', verifyAuthToken, async (req, res) => {
  const { body } = req;
  const questionId = body.question._id;
  const { usersAnswer } = body;
  const userId = req.user.id;

  try {
    const isAnswerCorrect = await isUsersAnswerCorrect(questionId, usersAnswer);

    const updateDbResult = await updateUsersResponseInDB(isAnswerCorrect, userId, questionId, usersAnswer);

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
    res.status(404).send(error.toString());
  }
});

/* Add 5 new questions
 * Acceptable Body format:
 * {
 *    questions: [
 *      {
 *        number: Number,
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
 *    date: String,
 *    class: String
 * }
*/
questionsRouter.post('/five', async (req, res) => {
  const { body } = req;
  const questionsArr = [];

  try {
    const { status, msg } = isPostFiveQuestionsBodyValid(body);

    if (status) {
      body.questions.forEach((que) => {
        const questionObject = createNewQueryObject(que);
        questionObject.date = moment(body.date).format(DATE_FORMAT);
        questionObject.class = body.class;
        questionObject.subject = body.subject;

        questionsArr.push(questionObject);
      });

      const questionsForSpecifiedDateAndClass = await QuestionModel.find({ date: body.date, class: body.class, subject: body.subject });

      if (questionsForSpecifiedDateAndClass.length) {
        throw new Error(`Questions for date: ${body.date}, class: ${body.class} and subject: ${body.subject} already exist. Please choose some other date, class or subject!`);
      }

      await QuestionModel.insertMany(questionsArr);
      // Questions created successfully
      const successMsg = 'Questions added successfully';
      logger.info(successMsg);
      res.status(201).send(successMsg);
    } else {
      throw new Error(msg);
    }
  } catch (err) {
    res.status(400).send(err.toString());
    logger.error(err.toString());
  }
});


module.exports = {
  questionsRouter,
};
