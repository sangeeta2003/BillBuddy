import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext()

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated && user) {
      const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'
      const newSocket = io(socketUrl, {
        transports: ['websocket', 'polling'],
      })

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id)
        // Join user's personal notification room
        if (user.id) {
          newSocket.emit('joinUser', user.id)
        }
      })

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected')
      })

      newSocket.on('error', (error) => {
        console.error('Socket error:', error)
      })

      setSocket(newSocket)

      return () => {
        newSocket.close()
      }
    }
  }, [isAuthenticated, user])

  const joinRoom = (roomId) => {
    if (socket) {
      socket.emit('joinRoom', roomId)
    }
  }

  const leaveRoom = (roomId) => {
    if (socket) {
      // Socket.io client doesn't have a direct leave method
      // The server will automatically remove the socket from rooms on disconnect
      // Or we can emit a custom leave event if needed
      socket.emit('leaveRoom', roomId)
    }
  }

  const sendMessage = (roomId, sender, message) => {
    if (socket) {
      socket.emit('sendMessage', { roomId, sender, message })
    }
  }

  const value = {
    socket,
    joinRoom,
    leaveRoom,
    sendMessage,
  }

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}
