const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema({
  email: { type: String, unique: true },
  passwordHash: { type: String, required: true },
  score: { type: Number, required: true, default: 0 },
  streak: { type: Number, required: true, default: 1 },
  role: { type: String, required: true, default: 'USER' },
  isEmailVerified: { type: Boolean, required: true, default: false },
  joinedOn: { type: Date, required: true, default: new Date() },
  isActive: { type: Boolean, required: true, default: true },
  questionsAttempted: {
    type: [
      {
        __id: mongoose.Types.ObjectId,
        optionsSelected: [String],
      },
    ],
    required: true,
    default: [],
  },
  loginSource: {
    type: String,
    enum: ['local', 'google', 'facebook'],
    required: true,
    default: 'local',
  },
});

const UserModel = mongoose.model('User', userSchema);

module.exports = {
  UserModel,
};
