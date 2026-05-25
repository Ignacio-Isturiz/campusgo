const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    displayName: {
      type: String,
      default: '',
      trim: true,
    },

    bio: {
      type: String,
      default: '',
      maxlength: 150,
    },

    role: {
      type: String,
      enum: ['admin', 'bienestar', 'estudiante'],
      default: 'estudiante',
      required: true,
    },

    active: {
      type: Boolean,
      default: true,
    },

    photoUrl: {
      type: String,
      default: null,
    },
    photoFileId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    phone: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);