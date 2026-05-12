require('dotenv').config();
const mongoose = require('mongoose');

const { normalizeEmail } = require('../src/services/security');

const emailArg = process.argv[2];

if (!emailArg) {
  console.error('Uso: node scripts/delete-email-records.js correo@unaula.edu.co');
  process.exit(1);
}

const email = normalizeEmail(emailArg);

async function deleteFromCollection(db, collectionName) {
  const collection = db.collection(collectionName);
  const result = await collection.deleteMany({ email });
  return result.deletedCount || 0;
}

async function main() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI no está definida en el entorno.');
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const db = mongoose.connection.db;
  const collections = ['users', 'authchallenges', 'authsessions', 'otps'];
  const summary = {};

  const users = await db.collection('users').find({ email }).toArray();
  const userIds = users.map((user) => user._id);

  try {
    summary.users = await deleteFromCollection(db, 'users');
  } catch (error) {
    summary.users = `error: ${error.message}`;
  }

  try {
    summary.authchallenges = await deleteFromCollection(db, 'authchallenges');
  } catch (error) {
    summary.authchallenges = `error: ${error.message}`;
  }

  try {
    summary.otps = await deleteFromCollection(db, 'otps');
  } catch (error) {
    summary.otps = `error: ${error.message}`;
  }

  try {
    const authSessions = db.collection('authsessions');
    const sessionResult = await authSessions.deleteMany({ user: { $in: userIds } });
    summary.authsessions = sessionResult.deletedCount || 0;
  } catch (error) {
    summary.authsessions = `error: ${error.message}`;
  }

  console.log(`Limpieza completada para ${email}`);
  console.log(summary);
}

main()
  .catch((error) => {
    console.error('No se pudo limpiar el correo:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => {});
  });