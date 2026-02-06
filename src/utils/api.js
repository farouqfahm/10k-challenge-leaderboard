const API_BASE = '/api'

function getHeaders() {
  const headers = {
    'Content-Type': 'application/json',
  }
  
  const token = localStorage.getItem('token')
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  return headers
}

async function request(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  })
  
  const data = await res.json()
  
  if (!res.ok) {
    throw new Error(data.error || 'Request failed')
  }
  
  return data
}

export const api = {
  // Leaderboard
  getLeaderboard: () => request('/leaderboard'),
  getUserStats: (userId) => request(`/leaderboard/user/${userId}`),
  getUserSales: (userId, limit = 10) => request(`/leaderboard/user/${userId}/sales?limit=${limit}`),
  
  // Sales
  addSale: (amount, description) => request('/sales', {
    method: 'POST',
    body: JSON.stringify({ amount, description }),
  }),
  deleteSale: (saleId) => request(`/sales/${saleId}`, {
    method: 'DELETE',
  }),
  
  // Feed
  getFeed: (limit = 20) => request(`/feed?limit=${limit}`),
  getMessages: (limit = 30) => request(`/feed/messages?limit=${limit}`),
  postMessage: (message, toUserId = null, type = 'general') => request('/feed/messages', {
    method: 'POST',
    body: JSON.stringify({ message, toUserId, type }),
  }),
  getQuote: () => request('/feed/quote'),
  
  // Badges
  getAllBadges: () => request('/badges'),
  getUserAchievements: (userId) => request(`/badges/user/${userId}`),
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateString) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export function timeAgo(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now - date) / 1000)
  
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  
  return formatDate(dateString)
}
