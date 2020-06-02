const emailValidator = require('email-validator');
const bcrypt = require('bcrypt');

const validatePassword = (password) => {
  const bcryptSaltRounds = 10;
  return bcrypt.hash(password, bcryptSaltRounds);
};

const validateEmail = (emailId) => new Promise((resolve, reject) => {
  const isValid = emailValidator.validate(emailId);
  if (isValid) {
    resolve(emailId);
  } else {
    reject(new Error('Invalid email'));
  }
});

module.exports = {
  validatePassword,
  validateEmail,
};
