import { Router } from 'express';
import db from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Challenge configuration
const CHALLENGE_GOAL = parseInt(process.env.CHALLENGE_GOAL) || 10000;
const CHALLENGE_START = process.env.CHALLENGE_START_DATE || '2024-02-01';
const CHALLENGE_END = process.env.CHALLENGE_END_DATE || '2024-03-02';

// Get leaderboard
router.get('/', (req, res) => {
  try {
    const leaderboard = db.prepare(`
      SELECT 
        u.id,
        u.name,
        u.avatar_color,
        u.created_at,
        u.last_active,
        COALESCE(SUM(s.amount), 0) as total_earnings,
        COUNT(s.id) as total_deals,
        COUNT(DISTINCT DATE(s.created_at)) as days_active
      FROM users u
      LEFT JOIN sales s ON u.id = s.user_id
      GROUP BY u.id
      ORDER BY total_earnings DESC
    `).all();

    // Calculate additional metrics
    const enrichedLeaderboard = leaderboard.map((user, index) => ({
      ...user,
      rank: index + 1,
      progress_percent: Math.min((user.total_earnings / CHALLENGE_GOAL) * 100, 100),
      goal: CHALLENGE_GOAL,
    }));

    res.json({
      leaderboard: enrichedLeaderboard,
      challenge: {
        goal: CHALLENGE_GOAL,
        start_date: CHALLENGE_START,
        end_date: CHALLENGE_END,
      },
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Get user stats
router.get('/user/:userId', (req, res) => {
  try {
    const { userId } = req.params;

    const user = db.prepare(`
      SELECT 
        u.id,
        u.name,
        u.avatar_color,
        u.created_at,
        COALESCE(SUM(s.amount), 0) as total_earnings,
        COUNT(s.id) as total_deals
      FROM users u
      LEFT JOIN sales s ON u.id = s.user_id
      WHERE u.id = ?
      GROUP BY u.id
    `).get(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get daily earnings for chart
    const dailyEarnings = db.prepare(`
      SELECT 
        DATE(created_at) as date,
        SUM(amount) as earnings,
        COUNT(*) as deals
      FROM sales
      WHERE user_id = ?
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `).all(userId);

    // Get achievements
    const achievements = db.prepare(`
      SELECT badge_id, unlocked_at
      FROM achievements
      WHERE user_id = ?
    `).all(userId);

    // Calculate streak
    const streak = calculateStreak(userId);

    // Get rank
    const rank = db.prepare(`
      SELECT COUNT(*) + 1 as rank
      FROM (
        SELECT user_id, SUM(amount) as total
        FROM sales
        GROUP BY user_id
        HAVING total > (
          SELECT COALESCE(SUM(amount), 0) FROM sales WHERE user_id = ?
        )
      )
    `).get(userId);

    res.json({
      user: {
        ...user,
        rank: rank.rank,
        progress_percent: Math.min((user.total_earnings / CHALLENGE_GOAL) * 100, 100),
        goal: CHALLENGE_GOAL,
        streak,
      },
      dailyEarnings,
      achievements,
    });
  } catch (error) {
    console.error('User stats error:', error);
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
});

// Get recent sales for a user
router.get('/user/:userId/sales', (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    const sales = db.prepare(`
      SELECT id, amount, description, created_at
      FROM sales
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `).all(userId, limit);

    res.json({ sales });
  } catch (error) {
    console.error('Sales fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
});

// Helper function to calculate streak
function calculateStreak(userId) {
  const dates = db.prepare(`
    SELECT DISTINCT DATE(created_at) as date
    FROM sales
    WHERE user_id = ?
    ORDER BY date DESC
  `).all(userId);

  if (dates.length === 0) return 0;

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const row of dates) {
    const saleDate = new Date(row.date);
    saleDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((currentDate - saleDate) / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) {
      streak++;
      currentDate = saleDate;
    } else {
      break;
    }
  }

  return streak;
}

export default router;
