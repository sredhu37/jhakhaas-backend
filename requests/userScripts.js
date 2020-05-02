const axios = require('axios');
// const mongoose = require('mongoose');
const logger = require('../utils/logger');

const addOneUser = () => {
  axios.post('http://127.0.0.1:3000/api/users', {
    "email": "Planweweret@gmail.com",
    "phone": 9740539479,
    "password": "abcddfd"
}).then((response) => {
    logger.info(response);
  }).catch((error) => {
    logger.error(error);
  });
};

addOneUser();