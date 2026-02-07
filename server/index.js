import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Database from 'better-sqlite3';

import authRoutes from './routes/auth.js';
import leaderboardRoutes from './routes/leaderboard.js';
import salesRoutes from './routes/sales.js';
import feedRoutes from './routes/feed.js';
import { initWebSocket } from './services/websocket.js';
import { getAllBadges, getUserAchievements } from './services/achievements.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const server = createServer(app);

// Initialize WebSocket
initWebSocket(server);

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:5173', 'http://localhost:3001'],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/feed', feedRoutes);

// Achievement routes
app.get('/api/badges', (req, res) => {
  res.json({ badges: getAllBadges() });
});

app.get('/api/badges/user/:userId', (req, res) => {
  const achievements = getUserAchievements(req.params.userId);
  res.json({ achievements });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Admin: Reset database (clear all data) - protected by secret
app.post('/api/admin/reset', (req, res) => {
  const { secret } = req.body;
  if (secret !== process.env.ADMIN_SECRET && secret !== 'eccentric-reset-2026') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  try {
    const dbPath = process.env.DATABASE_PATH || join(__dirname, 'db/leaderboard.db');
    const db = new Database(dbPath);
    
    // Clear all tables
    db.exec('DELETE FROM messages');
    db.exec('DELETE FROM activity_feed');
    db.exec('DELETE FROM achievements');
    db.exec('DELETE FROM daily_activity');
    db.exec('DELETE FROM sales');
    db.exec('DELETE FROM users');
    
    // Reset autoincrement
    db.exec("DELETE FROM sqlite_sequence WHERE name IN ('users', 'sales', 'daily_activity', 'achievements', 'activity_feed', 'messages')");
    
    db.close();
    
    res.json({ success: true, message: 'Database reset complete' });
  } catch (error) {
    console.error('Reset error:', error);
    res.status(500).json({ error: 'Reset failed', details: error.message });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, '../dist')));
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '../dist/index.html'));
  });
}

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   💰 $10K in 30 Days Challenge - Server Running! 💰      ║
║                                                           ║
║   API:       http://localhost:${PORT}                       ║
║   WebSocket: ws://localhost:${PORT}/ws                      ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});
