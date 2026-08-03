const db = require('../config/db');
const bcrypt = require('bcryptjs');

async function test() {
  await db.initDatabase();
  try {
    const res = await db.query('SELECT email, password_hash, role FROM users');
    console.log('Seeded users in database:');
    for (const r of res.rows) {
      const match = await bcrypt.compare('password123', r.password_hash);
      console.log(`Email: ${r.email} | Role: ${r.role} | Validates with 'password123': ${match} | Hash: ${r.password_hash}`);
    }
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}

test();
