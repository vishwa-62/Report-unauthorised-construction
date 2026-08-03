const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

require('dotenv').config();

let dbType = 'postgresql';
let pgPool = null;
let sqliteDb = null;

// Initialize Database connection
async function initDatabase() {
  const useFallback = process.env.USE_SQLITE_FALLBACK === 'true';

  if (!useFallback) {
    try {
      console.log('Attempting connection to PostgreSQL...');
      pgPool = new Pool({
        host: process.env.PGHOST || 'localhost',
        port: process.env.PGPORT || 5432,
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || 'postgres',
        database: process.env.PGDATABASE || 'cityguard',
        connectionTimeoutMillis: 5000
      });
      
      // Test the pool connection
      const client = await pgPool.connect();
      client.release();
      dbType = 'postgresql';
      console.log('PostgreSQL database connected successfully.');
      return;
    } catch (err) {
      console.error('PostgreSQL connection failed:', err.message);
      console.log('Falling back to SQLite as configured...');
    }
  }

  // SQLite Fallback
  dbType = 'sqlite';
  const dbPath = path.join(__dirname, '../cityguard.db');
  console.log(`Initializing SQLite database at: ${dbPath}`);
  
  const isNewDb = !fs.existsSync(dbPath);
  sqliteDb = new sqlite3.Database(dbPath);

  if (isNewDb) {
    console.log('New SQLite database detected. Setting up tables and mock data...');
    try {
      await setupSqliteDatabase();
      console.log('SQLite database setup complete.');
    } catch (err) {
      console.error('Failed to setup SQLite database:', err);
    }
  } else {
    console.log('SQLite database file already exists. Connected.');
  }
}

// Helper to execute SQL batch scripts in SQLite (promisified)
function execSqlite(sql) {
  return new Promise((resolve, reject) => {
    sqliteDb.exec(sql, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

// Helper to run query in SQLite (promisified)
function runSqlite(sql, params = []) {
  return new Promise((resolve, reject) => {
    sqliteDb.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

// Helper to get all records in SQLite (promisified)
function allSqlite(sql, params = []) {
  return new Promise((resolve, reject) => {
    sqliteDb.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// Create schema and seed in SQLite
async function setupSqliteDatabase() {
  // Read schema.sql and seed.sql from database directory
  const schemaPath = path.join(__dirname, '../../database/schema.sql');
  const seedPath = path.join(__dirname, '../../database/seed.sql');

  if (!fs.existsSync(schemaPath) || !fs.existsSync(seedPath)) {
    console.warn('Schema or Seed file not found. Creating minimal in-memory structure...');
    return;
  }

  let schemaSql = fs.readFileSync(schemaPath, 'utf8');
  let seedSql = fs.readFileSync(seedPath, 'utf8');

  // Convert PostgreSQL SQL to SQLite SQL
  // 1. SERIAL -> INTEGER PRIMARY KEY AUTOINCREMENT
  // 2. TIMESTAMP WITH TIME ZONE -> DATETIME
  // 3. VARCHAR(255) etc -> TEXT
  // 4. DECIMAL -> REAL
  // 5. Remove incompatible triggers/constraints if any
  schemaSql = schemaSql
    .replace(/SERIAL PRIMARY KEY/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT')
    .replace(/BIGSERIAL PRIMARY KEY/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT')
    .replace(/TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP/gi, 'DATETIME DEFAULT CURRENT_TIMESTAMP')
    .replace(/TIMESTAMP WITH TIME ZONE/gi, 'DATETIME')
    .replace(/DECIMAL\(\d+,\s*\d+\)/gi, 'REAL')
    .replace(/VARCHAR\(\d+\)/gi, 'TEXT')
    .replace(/ON CONFLICT \(email\) DO NOTHING/gi, 'ON CONFLICT (email) DO NOTHING')
    .replace(/ON CONFLICT \(zone_id, code\) DO NOTHING/gi, 'ON CONFLICT (zone_id, code) DO NOTHING')
    .replace(/ON CONFLICT \(complaint_number\) DO NOTHING/gi, 'ON CONFLICT (complaint_number) DO NOTHING')
    .replace(/ON CONFLICT \(setting_key\) DO NOTHING/gi, 'ON CONFLICT (setting_key) DO NOTHING')
    .replace(/ON CONFLICT \(name\) DO NOTHING/gi, 'ON CONFLICT (name) DO NOTHING')
    .replace(/ON CONFLICT \(id\) DO NOTHING/gi, 'ON CONFLICT (id) DO NOTHING')
    .replace(/ON CONFLICT \(user_id\) DO NOTHING/gi, 'ON CONFLICT (user_id) DO NOTHING');

  seedSql = seedSql
    .replace(/TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP/gi, 'DATETIME DEFAULT CURRENT_TIMESTAMP')
    .replace(/TIMESTAMP WITH TIME ZONE/gi, 'DATETIME')
    .replace(/DECIMAL\(\d+,\s*\d+\)/gi, 'REAL')
    .replace(/VARCHAR\(\d+\)/gi, 'TEXT')
    .replace(/ON CONFLICT \(email\) DO NOTHING/gi, 'ON CONFLICT (email) DO NOTHING')
    .replace(/ON CONFLICT \(zone_id, code\) DO NOTHING/gi, 'ON CONFLICT (zone_id, code) DO NOTHING')
    .replace(/ON CONFLICT \(complaint_number\) DO NOTHING/gi, 'ON CONFLICT (complaint_number) DO NOTHING')
    .replace(/ON CONFLICT \(setting_key\) DO NOTHING/gi, 'ON CONFLICT (setting_key) DO NOTHING')
    .replace(/ON CONFLICT \(name\) DO NOTHING/gi, 'ON CONFLICT (name) DO NOTHING')
    .replace(/ON CONFLICT \(id\) DO NOTHING/gi, 'ON CONFLICT (id) DO NOTHING')
    .replace(/ON CONFLICT \(user_id\) DO NOTHING/gi, 'ON CONFLICT (user_id) DO NOTHING');

  // Execute schema batch
  await execSqlite(schemaSql);

  // Execute seed batch
  try {
    await execSqlite(seedSql);
  } catch (err) {
    console.warn(`Seed script batch warning: ${err.message}`);
  }
}

// Unified Query Function
async function query(text, params = []) {
  if (dbType === 'postgresql') {
    const start = Date.now();
    try {
      const res = await pgPool.query(text, params);
      const duration = Date.now() - start;
      return { rows: res.rows, rowCount: res.rowCount };
    } catch (err) {
      throw err;
    }
  } else {
    // SQLite mode
    // Translate PostgreSQL $1, $2, etc placeholders to ?
    let sqliteText = text.replace(/\$\d+/g, '?');
    
    // Check if query is select vs write
    const isSelect = sqliteText.trim().match(/^(SELECT|WITH)/i);
    
    try {
      if (isSelect) {
        const rows = await allSqlite(sqliteText, params);
        return { rows, rowCount: rows.length };
      } else {
        const result = await runSqlite(sqliteText, params);
        // Map insert ID/changes to approximate PG response
        return { rows: [{ id: result.lastID }], rowCount: result.changes };
      }
    } catch (err) {
      console.error(`SQLite Error on: ${sqliteText}`, err);
      throw err;
    }
  }
}

module.exports = {
  initDatabase,
  query,
  getDbType: () => dbType
};
