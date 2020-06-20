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
  solution: { type: String, required: true },
  dateAsked: { type: String, required: true, unique: true },
  isAlreadyAsked: { type: Boolean, required: true, default: false },
  class: { type: 'String', required: true, default: 'OTHER' },
  difficultyLevel: {
    type: Number, required: true, default: 1, min: 1, max: 5,
  },
  questionRating: {
    type: Number, required: true, default: 4, min: 1, max: 5,
  },
});

const QuestionModel = mongoose.model('Question', questionSchema);

module.exports = {
  QuestionModel,
};
