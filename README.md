# 💰 $10K in 30 Days Challenge

A modern, real-time leaderboard app for tracking a sales competition between colleagues. Built with React, Node.js/Express, SQLite, and WebSockets.

![Dark mode UI](https://via.placeholder.com/800x400/0f172a/22c55e?text=$10K+Challenge+Leaderboard)

## ✨ Features

### Core Features
- **User Authentication** - Secure signup/login with JWT tokens
- **Real-time Leaderboard** - Instantly updates when anyone logs a sale
- **Personal Dashboard** - Track your progress, rank, and stats
- **Sale Logging** - Quick and easy sale entry with preset amounts

### Cool Features
- 🏆 **Achievement Badges** - Unlock badges like "First Blood", "$1K Day", "Whale Hunter"
- ⏰ **Countdown Timer** - Days/hours/minutes until challenge ends
- 📊 **Earnings Charts** - Visualize daily and cumulative earnings
- 🔥 **Streak Tracking** - Maintain your daily sales streak
- 💬 **Trash Talk Feed** - Friendly banter and motivation
- 💡 **Motivational Quotes** - Random sales wisdom
- ⚡ **Live Activity Feed** - See everyone's wins in real-time
- 📱 **Mobile Responsive** - Works great on all devices
- 🌙 **Dark Mode** - Easy on the eyes (it's the only mode!)

### Achievement Badges
| Badge | Name | Description |
|-------|------|-------------|
| 🎯 | First Blood | Close your first deal |
| 💵 | Hundred Club | Close a $100+ deal |
| 🐋 | Big Fish | Close a $500+ deal |
| 🐳 | Whale Hunter | Close a $1,000+ deal |
| 🔥 | $1K Day | Earn $1,000 in a single day |
| ⭐ | Halfway Hero | Reach $5,000 total |
| 🏆 | Goal Crusher | Reach the $10,000 goal |
| ⚡ | Deal Machine | Close 10 deals |
| ⚔️ | Sales Warrior | Close 20 deals |
| 🎩 | Hat Trick | 3-day sales streak |
| 🗓️ | Week Warrior | 7-day sales streak |
| 🐦 | Early Bird | Log a sale before 9 AM |
| 🦉 | Night Owl | Log a sale after 9 PM |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone or navigate to the project
cd leaderboard-app

# Install dependencies
npm install

# Initialize the database (seeds demo data)
npm run db:init

# Start development servers (backend + frontend)
npm run dev
```

The app will be available at:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001
- **WebSocket:** ws://localhost:3001/ws

### Demo Accounts
All demo accounts use password: `demo123`

| Email | Name |
|-------|------|
| alex@company.com | Alex Thompson |
| jordan@company.com | Jordan Lee |
| sam@company.com | Sam Rivera |
| taylor@company.com | Taylor Chen |
| casey@company.com | Casey Morgan |

## 🏗️ Project Structure

```
leaderboard-app/
├── server/                 # Backend
│   ├── db/
│   │   ├── schema.sql      # Database schema
│   │   ├── init.js         # DB initialization & seeding
│   │   └── database.js     # Database connection
│   ├── middleware/
│   │   └── auth.js         # JWT authentication
│   ├── routes/
│   │   ├── auth.js         # Login/signup endpoints
│   │   ├── leaderboard.js  # Leaderboard & user stats
│   │   ├── sales.js        # Sale CRUD operations
│   │   └── feed.js         # Activity feed & messages
│   ├── services/
│   │   ├── achievements.js # Badge logic
│   │   └── websocket.js    # Real-time updates
│   └── index.js            # Express server entry
├── src/                    # Frontend
│   ├── components/         # Reusable UI components
│   ├── pages/              # Route pages
│   ├── context/            # React contexts (Auth, WebSocket)
│   ├── hooks/              # Custom hooks
│   ├── utils/              # API client, formatters
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # Entry point
│   └── index.css           # Tailwind styles
├── public/                 # Static assets
├── .env.example            # Environment variables template
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## ⚙️ Configuration

Copy `.env.example` to `.env` and customize:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Secret - CHANGE THIS IN PRODUCTION!
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Challenge Configuration
CHALLENGE_START_DATE=2024-02-01
CHALLENGE_END_DATE=2024-03-02
CHALLENGE_GOAL=10000

# Database
DATABASE_PATH=./server/db/leaderboard.db
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Leaderboard
- `GET /api/leaderboard` - Get full leaderboard
- `GET /api/leaderboard/user/:userId` - Get user stats
- `GET /api/leaderboard/user/:userId/sales` - Get user's sales

### Sales
- `POST /api/sales` - Log a new sale (auth required)
- `DELETE /api/sales/:saleId` - Delete a sale (auth required)

### Feed
- `GET /api/feed` - Get activity feed
- `GET /api/feed/messages` - Get trash talk messages
- `POST /api/feed/messages` - Post a message (auth required)
- `GET /api/feed/quote` - Get random motivational quote

### Badges
- `GET /api/badges` - Get all available badges
- `GET /api/badges/user/:userId` - Get user's unlocked badges

## 🔄 WebSocket Events

The app uses WebSockets for real-time updates:

| Event | Direction | Description |
|-------|-----------|-------------|
| `CONNECTED` | Server → Client | Connection confirmed |
| `SALE_ADDED` | Server → Client | New sale logged |
| `SALE_DELETED` | Server → Client | Sale removed |
| `ACHIEVEMENT_UNLOCKED` | Server → Client | User earned a badge |
| `NEW_MESSAGE` | Server → Client | New chat message |

## 🏭 Production Build

```bash
# Build frontend
npm run build

# Start production server
npm start
```

The production server serves the built frontend from `/dist`.

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, React Router, Recharts, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** SQLite (better-sqlite3)
- **Auth:** JWT (jsonwebtoken, bcryptjs)
- **Real-time:** WebSockets (ws)

## 📝 License

MIT - Use it, modify it, make money with it! 💸

---

Built with ❤️ for sales warriors everywhere. Now go crush that $10K goal! 🚀
