import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password })
      const { token } = response.data
      localStorage.setItem('token', token)
      
      // Decode JWT to get user ID (simple base64 decode)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        const userData = { 
          id: payload.userId || payload.id,
          email: email 
        }
        localStorage.setItem('user', JSON.stringify(userData))
        setUser(userData)
      } catch (e) {
        // Fallback if JWT decode fails
        const userData = { email }
        localStorage.setItem('user', JSON.stringify(userData))
        setUser(userData)
      }
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      }
    }
  }

  const register = async (name, email, password) => {
    try {
      const response = await authAPI.register({ name, email, password })
      const { token, user: userData } = response.data
      localStorage.setItem('token', token)
      
      // Extract user ID from token or use response data
      const finalUserData = userData || {}
      if (!finalUserData.id) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          finalUserData.id = payload.userId || payload.id
        } catch (e) {
          // Keep userData as is
        }
      }
      if (!finalUserData.email) {
        finalUserData.email = email
      }
      
      localStorage.setItem('user', JSON.stringify(finalUserData))
      setUser(finalUserData)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
