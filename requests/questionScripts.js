const axios = require('axios');
// const mongoose = require('mongoose');
const logger = require('../utils/logger');

// const addOneQuestion = () => {
//   axios.post('http://127.0.0.1:3000/api/questions/', {
//     problemStatement: '5000 * 100 = ?',
//     options: {
//       a: '60000',
//       b: '5000',
//       c: '500000',
//       d: '40000',
//     },
//     solution: 'Answer: C',
//     difficultyLevel: 2,
//   }).then((response) => {
//     logger.info(response);
//   }).catch((error) => {
//     logger.error(error);
//   });
// };

const updateOneQuestion = () => {
  axios.put('http://127.0.0.1:3000/api/questions/5eacec447cfc3b5a8885beda', {
    questionRating: 1,
    isAlreadyAsked: true,
  }).then((response) => {
    logger.info(response);
  }).catch((error) => {
    logger.error(error);
  });
};

updateOneQuestion();
