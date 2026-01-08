import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { authAPI, expenseAPI, groupAPI } from '../services/api'
import { Link } from 'react-router-dom'
import { ArrowRight, Users, Receipt, Wallet, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [recentExpenses, setRecentExpenses] = useState([])
  const [userGroups, setUserGroups] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [user])

  const fetchDashboardData = async () => {
    try {
      if (user?.id) {
        const [dashboard, expenses, groups] = await Promise.all([
          authAPI.getDashboard(user.id),
          expenseAPI.getAll(),
          groupAPI.getUserGroups(user.id),
        ])

        setDashboardData(dashboard.data)
        setRecentExpenses(expenses.data.slice(0, 5))
        setUserGroups(groups.data.slice(0, 5))
      }
    } catch (error) {
      toast.error('Failed to load dashboard data')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, {user?.email}</p>
      </div>

      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Owed</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  ₹{dashboardData.totalOwed?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <Wallet className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Lent</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  ₹{dashboardData.totalLent?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Net Balance</p>
                <p
                  className={`text-2xl font-bold mt-1 ${
                    dashboardData.netBalance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  ₹{dashboardData.netBalance?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="p-3 bg-primary-100 rounded-full">
                <Wallet className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Expenses</h2>
            <Link
              to="/expenses"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
            >
              View all <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          {recentExpenses.length > 0 ? (
            <div className="space-y-3">
              {recentExpenses.map((expense) => (
                <div
                  key={expense._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{expense.title}</p>
                    <p className="text-sm text-gray-600">
                      Paid by {expense.paidBy?.name || 'Unknown'}
                    </p>
                  </div>
                  <p className="font-semibold">₹{expense.amount?.toFixed(2)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No expenses yet</p>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Your Groups</h2>
            <Link
              to="/groups"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
            >
              View all <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          {userGroups.length > 0 ? (
            <div className="space-y-3">
              {userGroups.map((group) => (
                <Link
                  key={group._id}
                  to={`/groups/${group._id}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-primary-600 mr-3" />
                    <div>
                      <p className="font-medium">{group.groupname}</p>
                      <p className="text-sm text-gray-600">
                        {group.members?.length || 0} members
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No groups yet</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
