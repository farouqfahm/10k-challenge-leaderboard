import { useState, useEffect, useCallback, useRef } from 'react'
import { api, timeAgo } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { useWebSocketEvent } from '../context/WebSocketContext'

export default function TrashTalk() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    loadMessages()
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }
  }, [messages])

  async function loadMessages() {
    try {
      const data = await api.getMessages(20)
      setMessages(data.messages)
    } catch (error) {
      console.error('Failed to load messages:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    setSending(true)
    try {
      await api.postMessage(newMessage.trim())
      setNewMessage('')
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setSending(false)
    }
  }

  const handleNewMessage = useCallback((payload) => {
    setMessages(prev => [payload, ...prev].slice(0, 20))
  }, [])

  useWebSocketEvent('NEW_MESSAGE', handleNewMessage)

  if (loading) {
    return (
      <div className="glass-card animate-pulse">
        <div className="h-6 bg-dark-800 rounded w-32 mb-4"></div>
        <div className="h-32 bg-dark-800 rounded"></div>
      </div>
    )
  }

  return (
    <div className="glass-card">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span>💬</span>
        Trash Talk & Hype
      </h2>

      {/* Message input */}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Talk trash or hype someone up..."
            className="input flex-1 text-sm"
            maxLength={280}
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="btn-primary py-2 px-4 text-sm"
          >
            {sending ? '...' : 'Send'}
          </button>
        </div>
        <p className="text-xs text-dark-500 mt-1 text-right">{newMessage.length}/280</p>
      </form>

      {/* Messages list */}
      <div ref={scrollRef} className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
        {messages.length === 0 ? (
          <p className="text-dark-500 text-center py-8">No messages yet. Start the banter!</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-3 rounded-xl ${
                msg.from_user_id === user?.id
                  ? 'bg-primary-500/10 border border-primary-500/20 ml-4'
                  : 'bg-dark-800/50 mr-4'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: msg.from_user_color }}
                >
                  {msg.from_user_name?.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-sm">{msg.from_user_name}</span>
                {msg.to_user_name && (
                  <span className="text-dark-500 text-xs">→ {msg.to_user_name}</span>
                )}
                <span className="text-dark-500 text-xs ml-auto">{timeAgo(msg.created_at)}</span>
              </div>
              <p className="text-sm text-dark-200 pl-8">{msg.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
