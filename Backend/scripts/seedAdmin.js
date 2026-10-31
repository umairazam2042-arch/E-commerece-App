// Admin account banane ke liye ek dafa chalayein:
//   node scripts/seedAdmin.js
// Values .env se li jati hain: ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, MONGO_URI

require('dotenv').config();

const mongoose = require('mongoose');
const User = require('../src/models/User');

const run = async () => {
  const { MONGO_URI, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!MONGO_URI) throw new Error('MONGO_URI is not set');
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD in .env');
  }

  await mongoose.connect(MONGO_URI);

  const email = ADMIN_EMAIL.toLowerCase();
  const existing = await User.findOne({ email });

  if (existing) {
    if (existing.role === 'admin') {
      console.log('Admin already exists:', email);
    } else {
      await User.updateOne({ _id: existing._id }, { role: 'admin' });
      console.log('Existing user promoted to admin:', email);
    }
  } else {
    await User.create({
      name: ADMIN_NAME || 'Admin',
      email,
      password: ADMIN_PASSWORD,
      role: 'admin',
      isEmailVerified: true,
    });
    console.log('Admin created:', email);
  }

  await mongoose.disconnect();
};

run().catch(async (err) => {
  console.error('Seed failed:', err.message);
  await mongoose.disconnect();
  process.exit(1);
});