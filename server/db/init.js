import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DATABASE_PATH || join(__dirname, 'leaderboard.db');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Read and execute schema
const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
db.exec(schema);

console.log('✅ Database initialized successfully!');
console.log('🎯 Ready for the $10K Challenge!');

db.close();
console.log('🎉 Database setup complete!');
