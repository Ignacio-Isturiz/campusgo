require('dotenv').config();
const mongoose = require('mongoose');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;

  console.log('Dropping old index "correo_1" from users collection...');
  try {
    await db.collection('users').dropIndex('correo_1');
    console.log('Index "correo_1" dropped successfully!');
  } catch (e) {
    console.log('Index "correo_1" not found or already dropped.');
  }

  // También vamos a borrar la colección 'otps' que está sobrando
  console.log('Dropping old collection "otps"...');
  try {
    await db.collection('otps').drop();
    console.log('Collection "otps" dropped successfully!');
  } catch (e) {
    console.log('Collection "otps" not found or already dropped.');
  }

  await mongoose.disconnect();
  console.log('Done.');
}

main().catch(err => { console.error(err); process.exit(1); });
