import { Router } from 'express';
import db from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';
import { checkAchievements } from '../services/achievements.js';
import { broadcast } from '../services/websocket.js';

const router = Router();

// Add a new sale
router.post('/', authMiddleware, (req, res) => {
  try {
    const { amount, description } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    // Insert sale
    const result = db.prepare(`
      INSERT INTO sales (user_id, amount, description)
      VALUES (?, ?, ?)
    `).run(userId, amount, description || 'Sale');

    // Update daily activity
    const today = new Date().toISOString().split('T')[0];
    db.prepare(`
      INSERT INTO daily_activity (user_id, date, earnings, deals_count)
      VALUES (?, ?, ?, 1)
      ON CONFLICT(user_id, date) DO UPDATE SET
        earnings = earnings + excluded.earnings,
        deals_count = deals_count + 1
    `).run(userId, today, amount);

    // Add to activity feed
    const userName = db.prepare('SELECT name FROM users WHERE id = ?').get(userId).name;
    db.prepare(`
      INSERT INTO activity_feed (user_id, type, message, amount)
      VALUES (?, 'sale', ?, ?)
    `).run(userId, `${userName} closed a $${amount.toLocaleString()} deal! 💰`, amount);

    // Update last active
    db.prepare('UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = ?').run(userId);

    // Check for new achievements
    const newAchievements = checkAchievements(userId);

    // Get updated user stats
    const userStats = db.prepare(`
      SELECT 
        COALESCE(SUM(amount), 0) as total_earnings,
        COUNT(*) as total_deals
      FROM sales
      WHERE user_id = ?
    `).get(userId);

    // Broadcast update to all clients
    broadcast({
      type: 'SALE_ADDED',
      payload: {
        userId,
        userName,
        amount,
        description,
        totalEarnings: userStats.total_earnings,
        totalDeals: userStats.total_deals,
        timestamp: new Date().toISOString(),
      },
    });

    if (newAchievements.length > 0) {
      broadcast({
        type: 'ACHIEVEMENT_UNLOCKED',
        payload: {
          userId,
          userName,
          achievements: newAchievements,
        },
      });
    }

    res.json({
      sale: {
        id: result.lastInsertRowid,
        amount,
        description,
        created_at: new Date().toISOString(),
      },
      userStats,
      newAchievements,
    });
  } catch (error) {
    console.error('Add sale error:', error);
    res.status(500).json({ error: 'Failed to add sale' });
  }
});

// Delete a sale (only own sales)
router.delete('/:saleId', authMiddleware, (req, res) => {
  try {
    const { saleId } = req.params;
    const userId = req.user.id;

    // Check ownership
    const sale = db.prepare('SELECT * FROM sales WHERE id = ? AND user_id = ?').get(saleId, userId);
    if (!sale) {
      return res.status(404).json({ error: 'Sale not found or not authorized' });
    }

    // Delete sale
    db.prepare('DELETE FROM sales WHERE id = ?').run(saleId);

    // Broadcast update
    broadcast({
      type: 'SALE_DELETED',
      payload: { userId, saleId },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete sale error:', error);
    res.status(500).json({ error: 'Failed to delete sale' });
  }
});

export default router;
