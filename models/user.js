const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema({
  email: { type: String, unique: true },
  role: { type: String, required: true, default: 'USER' },
  joinedOn: { type: Date, required: true, default: new Date() },
  isActive: { type: Boolean, required: true, default: true },
  totalScore: { type: Number, required: true, default: 0 },
  name: { type: String, required: true, default: '' },
  class: { type: String, required: true, default: 'OTHER' },
  questionsAttempted: {
    type: [
      {
        _id: mongoose.Types.ObjectId,
        optionsSelected: {
          type: {
            a: { type: Boolean, default: false },
            b: { type: Boolean, default: false },
            c: { type: Boolean, default: false },
            d: { type: Boolean, default: false },
          },
        },
        triesCount: { type: Number, required: true, default: 0 },
        score: { type: Number, required: true, default: 0 },
      },
    ],
    required: true,
    default: [],
  },
  loginSource: {
    type: String,
    enum: ['local', 'google'],
    required: true,
    default: 'local',
  },
  googleId: String,
  pictureUrl: String,
});

const UserModel = mongoose.model('User', userSchema);

module.exports = {
  UserModel,
};
