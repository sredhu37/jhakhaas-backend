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

const createNewUser = (body, email, passwordHash) => {
  let obj = {};
  if (body.loginSource === 'google') { // Registered via Google
    obj = {
      email,
    };
  } else { // Registered Locally via Username and Password
    obj = {
      email,
      passwordHash,
    };
  }

  const keys = Object.keys(body);

  keys.forEach((key) => {
    obj[key] = body[key];
  });

  return obj;
};

module.exports = {
  validatePassword,
  validateEmail,
  createNewUser,
};
