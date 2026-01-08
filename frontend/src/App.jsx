import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { SocketProvider } from './contexts/SocketContext'
import PrivateRoute from './components/PrivateRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Groups from './pages/Groups'
import GroupDetail from './pages/GroupDetail'
import Expenses from './pages/Expenses'
import Balance from './pages/Balance'
import Settlements from './pages/Settlements'
import Layout from './components/Layout'

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="groups" element={<Groups />} />
              <Route path="groups/:groupId" element={<GroupDetail />} />
              <Route path="expenses" element={<Expenses />} />
              <Route path="balance" element={<Balance />} />
              <Route path="settlements" element={<Settlements />} />
            </Route>
          </Routes>
        </Router>
      </SocketProvider>
    </AuthProvider>
  )
}

export default App
