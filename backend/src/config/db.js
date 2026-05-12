const mongoose = require('mongoose');
const { ensureAdminUser } = require('../services/bootstrap');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('MongoDB conectado 🚀');
    await ensureAdminUser();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;