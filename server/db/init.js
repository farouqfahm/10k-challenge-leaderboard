import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DATABASE_PATH || join(__dirname, 'leaderboard.db');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Read and execute schema
const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
db.exec(schema);

console.log('✅ Database initialized successfully!');

// Seed some demo data if database is empty
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();

if (userCount.count === 0) {
  console.log('📦 Seeding demo data...');
  
  const demoUsers = [
    { email: 'alex@company.com', name: 'Alex Thompson', color: '#ef4444' },
    { email: 'jordan@company.com', name: 'Jordan Lee', color: '#3b82f6' },
    { email: 'sam@company.com', name: 'Sam Rivera', color: '#8b5cf6' },
    { email: 'taylor@company.com', name: 'Taylor Chen', color: '#f59e0b' },
    { email: 'casey@company.com', name: 'Casey Morgan', color: '#ec4899' },
  ];

  const insertUser = db.prepare(`
    INSERT INTO users (email, password_hash, name, avatar_color) 
    VALUES (?, ?, ?, ?)
  `);

  const insertSale = db.prepare(`
    INSERT INTO sales (user_id, amount, description, created_at)
    VALUES (?, ?, ?, ?)
  `);

  const insertActivity = db.prepare(`
    INSERT INTO daily_activity (user_id, date, earnings, deals_count)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(user_id, date) DO UPDATE SET
      earnings = earnings + excluded.earnings,
      deals_count = deals_count + excluded.deals_count
  `);

  const insertFeed = db.prepare(`
    INSERT INTO activity_feed (user_id, type, message, amount, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertAchievement = db.prepare(`
    INSERT OR IGNORE INTO achievements (user_id, badge_id, unlocked_at)
    VALUES (?, ?, ?)
  `);

  // All demo users have password: "demo123"
  const passwordHash = bcrypt.hashSync('demo123', 10);

  const dealDescriptions = [
    'Enterprise software license',
    'Annual subscription renewal',
    'Consulting package',
    'Premium support tier',
    'Custom integration service',
    'Training workshop',
    'Data analytics bundle',
    'Security audit service',
  ];

  const transaction = db.transaction(() => {
    for (const user of demoUsers) {
      const result = insertUser.run(user.email, passwordHash, user.name, user.color);
      const userId = result.lastInsertRowid;

      // Generate random sales over past 15 days
      const numSales = Math.floor(Math.random() * 12) + 5;
      let totalEarnings = 0;

      for (let i = 0; i < numSales; i++) {
        const daysAgo = Math.floor(Math.random() * 15);
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        date.setHours(Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 60));

        const amount = Math.floor(Math.random() * 1500) + 100;
        const description = dealDescriptions[Math.floor(Math.random() * dealDescriptions.length)];

        insertSale.run(userId, amount, description, date.toISOString());
        totalEarnings += amount;

        // Update daily activity
        const dateStr = date.toISOString().split('T')[0];
        insertActivity.run(userId, dateStr, amount, 1);

        // Add to activity feed
        insertFeed.run(userId, 'sale', `${user.name} closed a $${amount.toLocaleString()} deal!`, amount, date.toISOString());
      }

      // Award some achievements based on performance
      insertAchievement.run(userId, 'first_sale', new Date().toISOString());
      
      if (totalEarnings >= 5000) {
        insertAchievement.run(userId, 'halfway', new Date().toISOString());
      }
      
      if (numSales >= 10) {
        insertAchievement.run(userId, 'deal_machine', new Date().toISOString());
      }
    }
  });

  transaction();
  console.log('✅ Demo data seeded! Login with any email above and password: demo123');
}

db.close();
console.log('🎉 Database setup complete!');
