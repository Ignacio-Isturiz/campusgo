const mongoose = require('mongoose');

const classBlockSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    default: '',
  },
  room: {
    type: String,
    default: '',
  },
  teacher: {
    type: String,
    default: '',
  },
  group: {
    type: String,
    default: '',
  },
  credits: {
    type: Number,
    default: 3,
  },
  color: {
    type: String,
    default: '#5B8DEF',
  },
  day: {
    type: String,
    enum: ['L', 'M', 'X', 'J', 'V', 'S'],
    required: true,
  },
  startHour: {
    type: Number,
    required: true,
  },
  endHour: {
    type: Number,
    required: true,
  },
});

const scheduleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    blocks: [classBlockSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Schedule', scheduleSchema);
