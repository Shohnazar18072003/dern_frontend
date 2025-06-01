"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useAuth } from "./useAuth"

interface WebSocketMessage {
  type: string
  data: any
  timestamp: string
}

export const useWebSocket = (url?: string) => {
  const { user } = useAuth()
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState<WebSocketMessage[]>([])
  const ws = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  const wsUrl = url || `${import.meta.env.VITE_WS_URL || "ws://localhost:5000"}/ws`

  const connect = useCallback(() => {
    if (!user) return

    try {
      const token = localStorage.getItem("accessToken")
      const socketUrl = `${wsUrl}?token=${token}`

      ws.current = new WebSocket(socketUrl)

      ws.current.onopen = () => {
        console.log("WebSocket connected")
        setIsConnected(true)
        reconnectAttempts.current = 0
      }

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          setMessages((prev) => [...prev, message])
        } catch (error) {
          console.error("Error parsing WebSocket message:", error)
        }
      }

      ws.current.onclose = () => {
        console.log("WebSocket disconnected")
        setIsConnected(false)

        // Attempt to reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++
          const delay = Math.pow(2, reconnectAttempts.current) * 1000 // Exponential backoff

          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Attempting to reconnect... (${reconnectAttempts.current}/${maxReconnectAttempts})`)
            connect()
          }, delay)
        }
      }

      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error)
      }
    } catch (error) {
      console.error("Error creating WebSocket connection:", error)
    }
  }, [user, wsUrl])

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }

    if (ws.current) {
      ws.current.close()
      ws.current = null
    }

    setIsConnected(false)
  }

  const sendMessage = (type: string, data: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const message = {
        type,
        data,
        timestamp: new Date().toISOString(),
      }
      ws.current.send(JSON.stringify(message))
    }
  }

  useEffect(() => {
    if (user) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [connect, user])

  return {
    isConnected,
    messages,
    sendMessage,
    connect,
    disconnect,
  }
}
