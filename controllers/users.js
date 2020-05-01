const express = require('express');
const usersRouter = express.Router();

usersRouter.get('/', (req, res) => {
  res.json({
    message: 'List of all users',
  });
});

module.exports = {
  usersRouter,
};
