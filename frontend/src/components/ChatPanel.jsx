import { useState, useEffect, useRef } from 'react'
import { chatAPI } from '../services/api'
import { useSocket } from '../contexts/SocketContext'
import { useAuth } from '../contexts/AuthContext'
import { X, Send } from 'lucide-react'
import { format } from 'date-fns'

const ChatPanel = ({ groupId, onClose }) => {
  const { socket } = useSocket()
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    fetchMessages()
  }, [groupId])

  useEffect(() => {
    if (socket) {
      socket.on('receiveMessage', (data) => {
        setMessages((prev) => [...prev, data])
      })
    }

    return () => {
      if (socket) {
        socket.off('receiveMessage')
      }
    }
  }, [socket])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    try {
      const response = await chatAPI.getMessages(groupId)
      setMessages(response.data)
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const messageData = {
      groupId,
      senderId: user?.id,
      message: newMessage,
    }

    chatAPI.sendMessage(messageData)
    setNewMessage('')
  }

  return (
    <div className="fixed right-0 top-0 h-full w-full md:w-96 bg-white shadow-xl z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold">Group Chat</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="text-center text-gray-500">Loading messages...</div>
        ) : messages.length > 0 ? (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs p-3 rounded-lg ${
                  msg.senderId === user?.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{msg.message}</p>
                <p
                  className={`text-xs mt-1 ${
                    msg.senderId === user?.id ? 'text-primary-100' : 'text-gray-500'
                  }`}
                >
                  {msg.time ? format(new Date(msg.time), 'HH:mm') : ''}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500">No messages yet</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="input flex-1"
          />
          <button type="submit" className="btn btn-primary">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  )
}

export default ChatPanel
