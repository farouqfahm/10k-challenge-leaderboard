import { Router } from 'express';
import db from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';
import { broadcast } from '../services/websocket.js';

const router = Router();

// Get activity feed
router.get('/', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    const feed = db.prepare(`
      SELECT 
        af.id,
        af.type,
        af.message,
        af.amount,
        af.created_at,
        u.id as user_id,
        u.name as user_name,
        u.avatar_color
      FROM activity_feed af
      JOIN users u ON af.user_id = u.id
      ORDER BY af.created_at DESC
      LIMIT ?
    `).all(limit);

    res.json({ feed });
  } catch (error) {
    console.error('Feed error:', error);
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
});

// Get messages (trash talk / motivation)
router.get('/messages', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 30;

    const messages = db.prepare(`
      SELECT 
        m.id,
        m.message,
        m.type,
        m.created_at,
        fu.id as from_user_id,
        fu.name as from_user_name,
        fu.avatar_color as from_user_color,
        tu.id as to_user_id,
        tu.name as to_user_name
      FROM messages m
      JOIN users fu ON m.from_user_id = fu.id
      LEFT JOIN users tu ON m.to_user_id = tu.id
      ORDER BY m.created_at DESC
      LIMIT ?
    `).all(limit);

    res.json({ messages });
  } catch (error) {
    console.error('Messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Post a message
router.post('/messages', authMiddleware, (req, res) => {
  try {
    const { message, toUserId, type } = req.body;
    const fromUserId = req.user.id;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (message.length > 280) {
      return res.status(400).json({ error: 'Message too long (max 280 characters)' });
    }

    const result = db.prepare(`
      INSERT INTO messages (from_user_id, to_user_id, message, type)
      VALUES (?, ?, ?, ?)
    `).run(fromUserId, toUserId || null, message.trim(), type || 'general');

    const fromUser = db.prepare('SELECT name, avatar_color FROM users WHERE id = ?').get(fromUserId);
    const toUser = toUserId ? db.prepare('SELECT name FROM users WHERE id = ?').get(toUserId) : null;

    const newMessage = {
      id: result.lastInsertRowid,
      message: message.trim(),
      type: type || 'general',
      created_at: new Date().toISOString(),
      from_user_id: fromUserId,
      from_user_name: fromUser.name,
      from_user_color: fromUser.avatar_color,
      to_user_id: toUserId || null,
      to_user_name: toUser?.name || null,
    };

    // Broadcast to all clients
    broadcast({
      type: 'NEW_MESSAGE',
      payload: newMessage,
    });

    res.json({ message: newMessage });
  } catch (error) {
    console.error('Post message error:', error);
    res.status(500).json({ error: 'Failed to post message' });
  }
});

// Motivational quotes
const MOTIVATIONAL_QUOTES = [
  "The only limit to your earnings is your imagination. 💭",
  "Every 'no' brings you closer to 'yes'. Keep pushing! 💪",
  "Success is the sum of small efforts repeated daily. 📈",
  "Your competition is not other salespeople. Your competition is your potential. 🎯",
  "Wake up with determination. Go to bed with satisfaction. 🌟",
  "Don't count the days. Make the days count. ⏰",
  "The best time to make a sale was yesterday. The second best time is NOW. 🚀",
  "Winners don't wait for chances. They create them. 🏆",
  "Your bank account is a reflection of your belief in yourself. 💰",
  "Close deals. Build dreams. Repeat. 🔄",
];

router.get('/quote', (req, res) => {
  const quote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
  res.json({ quote });
});

export default router;
