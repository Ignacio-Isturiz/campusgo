const mongoose = require('mongoose');

const authChallengeSchema = new mongoose.Schema(
  {
    challengeId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    purpose: {
      type: String,
      enum: ['register', 'login', 'forgot-password'],
      required: true,
      index: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    otpSalt: {
      type: String,
      required: true,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    resetTokenHash: {
      type: String,
      default: null,
    },
    resetTokenSalt: {
      type: String,
      default: null,
    },
    consumedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('AuthChallenge', authChallengeSchema);