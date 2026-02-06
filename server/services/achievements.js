import db from '../db/database.js';

export const BADGES = {
  first_sale: {
    id: 'first_sale',
    name: 'First Blood',
    description: 'Close your first deal',
    emoji: '🎯',
    color: '#22c55e',
  },
  hundred_club: {
    id: 'hundred_club',
    name: 'Hundred Club',
    description: 'Close a deal worth $100+',
    emoji: '💵',
    color: '#4ade80',
  },
  thousand_day: {
    id: 'thousand_day',
    name: '$1K Day',
    description: 'Earn $1,000 in a single day',
    emoji: '🔥',
    color: '#f59e0b',
  },
  five_thousand: {
    id: 'five_thousand',
    name: 'Halfway Hero',
    description: 'Reach $5,000 total earnings',
    emoji: '⭐',
    color: '#8b5cf6',
  },
  ten_thousand: {
    id: 'ten_thousand',
    name: 'Goal Crusher',
    description: 'Reach the $10,000 goal!',
    emoji: '🏆',
    color: '#fbbf24',
  },
  deal_machine: {
    id: 'deal_machine',
    name: 'Deal Machine',
    description: 'Close 10 deals',
    emoji: '⚡',
    color: '#3b82f6',
  },
  twenty_deals: {
    id: 'twenty_deals',
    name: 'Sales Warrior',
    description: 'Close 20 deals',
    emoji: '⚔️',
    color: '#ef4444',
  },
  streak_3: {
    id: 'streak_3',
    name: 'Hat Trick',
    description: '3-day sales streak',
    emoji: '🎩',
    color: '#06b6d4',
  },
  streak_7: {
    id: 'streak_7',
    name: 'Week Warrior',
    description: '7-day sales streak',
    emoji: '🗓️',
    color: '#ec4899',
  },
  early_bird: {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Log a sale before 9 AM',
    emoji: '🐦',
    color: '#fcd34d',
  },
  night_owl: {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Log a sale after 9 PM',
    emoji: '🦉',
    color: '#6366f1',
  },
  big_fish: {
    id: 'big_fish',
    name: 'Big Fish',
    description: 'Close a deal worth $500+',
    emoji: '🐋',
    color: '#0ea5e9',
  },
  whale: {
    id: 'whale',
    name: 'Whale Hunter',
    description: 'Close a deal worth $1,000+',
    emoji: '🐳',
    color: '#14b8a6',
  },
};

export function checkAchievements(userId) {
  const newAchievements = [];

  // Get user stats
  const stats = db.prepare(`
    SELECT 
      COUNT(*) as total_deals,
      COALESCE(SUM(amount), 0) as total_earnings,
      MAX(amount) as largest_deal
    FROM sales
    WHERE user_id = ?
  `).get(userId);

  // Get today's earnings
  const today = new Date().toISOString().split('T')[0];
  const todayStats = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as today_earnings
    FROM sales
    WHERE user_id = ? AND DATE(created_at) = ?
  `).get(userId, today);

  // Get current streak
  const streak = calculateStreak(userId);

  // Get last sale time
  const lastSale = db.prepare(`
    SELECT created_at FROM sales
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 1
  `).get(userId);

  const checkBadge = (badgeId, condition) => {
    if (!condition) return;

    const existing = db.prepare(`
      SELECT id FROM achievements WHERE user_id = ? AND badge_id = ?
    `).get(userId, badgeId);

    if (!existing) {
      db.prepare(`
        INSERT INTO achievements (user_id, badge_id)
        VALUES (?, ?)
      `).run(userId, badgeId);

      newAchievements.push(BADGES[badgeId]);

      // Add to activity feed
      const userName = db.prepare('SELECT name FROM users WHERE id = ?').get(userId).name;
      db.prepare(`
        INSERT INTO activity_feed (user_id, type, message)
        VALUES (?, 'achievement', ?)
      `).run(userId, `${userName} unlocked "${BADGES[badgeId].name}" ${BADGES[badgeId].emoji}`);
    }
  };

  // Check all achievements
  checkBadge('first_sale', stats.total_deals >= 1);
  checkBadge('hundred_club', stats.largest_deal >= 100);
  checkBadge('big_fish', stats.largest_deal >= 500);
  checkBadge('whale', stats.largest_deal >= 1000);
  checkBadge('thousand_day', todayStats.today_earnings >= 1000);
  checkBadge('five_thousand', stats.total_earnings >= 5000);
  checkBadge('ten_thousand', stats.total_earnings >= 10000);
  checkBadge('deal_machine', stats.total_deals >= 10);
  checkBadge('twenty_deals', stats.total_deals >= 20);
  checkBadge('streak_3', streak >= 3);
  checkBadge('streak_7', streak >= 7);

  // Time-based achievements
  if (lastSale) {
    const hour = new Date(lastSale.created_at).getHours();
    checkBadge('early_bird', hour < 9);
    checkBadge('night_owl', hour >= 21);
  }

  return newAchievements;
}

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

export function getAllBadges() {
  return Object.values(BADGES);
}

export function getUserAchievements(userId) {
  const achievements = db.prepare(`
    SELECT badge_id, unlocked_at
    FROM achievements
    WHERE user_id = ?
  `).all(userId);

  return achievements.map(a => ({
    ...BADGES[a.badge_id],
    unlocked_at: a.unlocked_at,
  }));
}
