const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema({
  email: { type: String, unique: true },
  passwordHash: { type: String },
  role: { type: String, required: true, default: 'USER' },
  isEmailVerified: { type: Boolean, required: true, default: false },
  joinedOn: { type: Date, required: true, default: new Date() },
  isActive: { type: Boolean, required: true, default: true },
  questionsAttempted: {
    type: [
      {
        _id: mongoose.Types.ObjectId,
        optionsSelected: String,
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
  otp: String,
});

const UserModel = mongoose.model('User', userSchema);

module.exports = {
  UserModel,
};
