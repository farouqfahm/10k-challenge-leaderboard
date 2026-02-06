import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'

const WebSocketContext = createContext(null)

export function WebSocketProvider({ children }) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState(null)
  const ws = useRef(null)
  const listeners = useRef(new Set())

  useEffect(() => {
    connect()
    
    return () => {
      if (ws.current) {
        ws.current.close()
      }
    }
  }, [])

  function connect() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = import.meta.env.DEV ? 'localhost:3001' : window.location.host
    ws.current = new WebSocket(`${protocol}//${host}/ws`)

    ws.current.onopen = () => {
      console.log('WebSocket connected')
      setIsConnected(true)
    }

    ws.current.onclose = () => {
      console.log('WebSocket disconnected')
      setIsConnected(false)
      // Reconnect after 3 seconds
      setTimeout(connect, 3000)
    }

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    ws.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        setLastMessage(message)
        
        // Notify all listeners
        listeners.current.forEach(callback => callback(message))
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }
  }

  const subscribe = useCallback((callback) => {
    listeners.current.add(callback)
    return () => listeners.current.delete(callback)
  }, [])

  return (
    <WebSocketContext.Provider value={{ isConnected, lastMessage, subscribe }}>
      {children}
    </WebSocketContext.Provider>
  )
}

export function useWebSocket() {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider')
  }
  return context
}

export function useWebSocketEvent(eventType, callback) {
  const { subscribe } = useWebSocket()
  
  useEffect(() => {
    return subscribe((message) => {
      if (message.type === eventType) {
        callback(message.payload)
      }
    })
  }, [eventType, callback, subscribe])
}
