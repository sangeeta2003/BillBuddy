import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  LayoutDashboard,
  Users,
  Receipt,
  Wallet,
  MessageSquare,
  LogOut,
  Bell,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { notificationAPI } from '../services/api'
import { useSocket } from '../contexts/SocketContext'

const Layout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { socket } = useSocket()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (user?.id) {
      fetchNotifications()
    }
  }, [user])

  useEffect(() => {
    if (socket) {
      socket.on('receiveNotification', (data) => {
        setNotifications((prev) => [data, ...prev])
        setUnreadCount((prev) => prev + 1)
      })
    }

    return () => {
      if (socket) {
        socket.off('receiveNotification')
      }
    }
  }, [socket])

  const fetchNotifications = async () => {
    try {
      if (user?.id) {
        const response = await notificationAPI.getUserNotifications(user.id)
        setNotifications(response.data)
        setUnreadCount(response.data.filter((n) => !n.read).length)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/groups', icon: Users, label: 'Groups' },
    { path: '/expenses', icon: Receipt, label: 'Expenses' },
    { path: '/balance', icon: Wallet, label: 'Balance' },
    { path: '/settlements', icon: Wallet, label: 'Settlements' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-2xl font-bold text-primary-600">BillBuddy</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.path
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        isActive
                          ? 'border-primary-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-2" />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="w-6 h-6 text-gray-600 cursor-pointer" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">{user?.email || 'User'}</span>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-gray-700"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
