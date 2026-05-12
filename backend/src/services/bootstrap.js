const User = require('../models/User');
const { hashPassword, normalizeEmail } = require('./security');

async function ensureAdminUser() {
  const adminEmail = normalizeEmail(process.env.ADMIN_EMAIL || 'admin@unaula.edu.co');
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin';

  const existingAdmin = await User.findOne({ email: adminEmail });

  if (existingAdmin) {
    if (existingAdmin.role !== 'admin') {
      existingAdmin.role = 'admin';
      await existingAdmin.save();
    }

    return existingAdmin;
  }

  return User.create({
    email: adminEmail,
    passwordHash: hashPassword(adminPassword),
    role: 'admin',
  });
}

module.exports = {
  ensureAdminUser,
};