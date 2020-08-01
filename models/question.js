const mongoose = require('mongoose');

const { Schema } = mongoose;

const questionSchema = new Schema({
  problemStatement: { type: String, required: true },
  options: {
    type: {
      a: { type: String, required: true },
      b: { type: String, required: true },
      c: { type: String, required: true },
      d: { type: String, required: true },
    },
    required: true,
  },
  answer: {
    type: {
      a: { type: Boolean, required: true, default: false },
      b: { type: Boolean, required: true, default: false },
      c: { type: Boolean, required: true, default: false },
      d: { type: Boolean, required: true, default: false },
    },
    required: true,
  },
  solution: { type: String, default: '' },
  class: { type: Number, required: true },
  subject: { type: String, required: true, default: 'general' },
  chapter: { type: String, required: true, default: 'general' },
  difficultyLevel: {
    type: Number, required: true, default: 1, min: 1, max: 5,
  },
  uploader: { type: String, required: true },
});

const QuestionModel = mongoose.model('Question', questionSchema);

module.exports = {
  QuestionModel,
};
