require('dotenv').config();
const mongoose = require('mongoose');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;

  // Check users collection indexes
  console.log('\n=== USERS INDEXES ===');
  const usersIndexes = await db.collection('users').indexes();
  console.log(JSON.stringify(usersIndexes, null, 2));

  // Check users collection documents
  console.log('\n=== USERS DOCUMENTS ===');
  const users = await db.collection('users').find({}).toArray();
  console.log(`Total users: ${users.length}`);
  users.forEach(u => console.log(`  - ${u.email} (role: ${u.role})`));

  // Check if otps collection exists and its indexes
  const collections = await db.listCollections().toArray();
  console.log('\n=== ALL COLLECTIONS ===');
  collections.forEach(c => console.log(`  - ${c.name}`));

  if (collections.find(c => c.name === 'otps')) {
    console.log('\n=== OTPS INDEXES ===');
    const otpsIndexes = await db.collection('otps').indexes();
    console.log(JSON.stringify(otpsIndexes, null, 2));

    console.log('\n=== OTPS DOCUMENTS ===');
    const otps = await db.collection('otps').find({}).toArray();
    console.log(`Total otps: ${otps.length}`);
    otps.forEach(o => console.log(`  - email: ${o.email}, purpose: ${o.purpose}`));
  }

  await mongoose.disconnect();
  console.log('\nDone.');
}

main().catch(err => { console.error(err); process.exit(1); });
