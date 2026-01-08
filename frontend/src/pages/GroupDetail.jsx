import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { groupAPI, expenseAPI, chatAPI, activityAPI } from '../services/api'
import { useSocket } from '../contexts/SocketContext'
import { useAuth } from '../contexts/AuthContext'
import { ArrowLeft, Plus, MessageSquare, Receipt, Activity, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'
import CreateExpenseModal from '../components/CreateExpenseModal'
import ChatPanel from '../components/ChatPanel'
import AddMembersModal from '../components/AddMembersModal'

const GroupDetail = () => {
  const { groupId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { joinRoom, leaveRoom } = useSocket()
  const [group, setGroup] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [activities, setActivities] = useState([])
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [showAddMembersModal, setShowAddMembersModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGroupData()
    if (groupId) {
      joinRoom(groupId)
    }

    return () => {
      if (groupId) {
        leaveRoom(groupId)
      }
    }
  }, [groupId])

  const fetchGroupData = async () => {
    try {
      const [groupRes, expensesRes, activitiesRes] = await Promise.all([
        groupAPI.getById(groupId),
        expenseAPI.getAll(),
        activityAPI.getGroupActivities(groupId),
      ])

      setGroup(groupRes.data)
      // Filter expenses by groupId
      const groupExpenses = expensesRes.data.filter((e) => {
        return e.groupId === groupId || 
               (e.groupId && e.groupId.toString() === groupId)
      })
      setExpenses(groupExpenses)
      setActivities(activitiesRes.data)
    } catch (error) {
      toast.error('Failed to load group data')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleExpenseCreated = () => {
    fetchGroupData()
    setShowExpenseModal(false)
  }

  const handleMembersAdded = () => {
    fetchGroupData()
    setShowAddMembersModal(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-600">Group not found</p>
        <button onClick={() => navigate('/groups')} className="btn btn-primary mt-4">
          Back to Groups
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/groups')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{group.groupname}</h1>
            {group.description && (
              <p className="text-gray-600 mt-1">{group.description}</p>
            )}
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowChat(!showChat)}
            className="btn btn-secondary flex items-center"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            Chat
          </button>
          <button
            onClick={() => setShowExpenseModal(true)}
            className="btn btn-primary flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Expense
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <Receipt className="w-5 h-5 mr-2" />
                Expenses
              </h2>
            </div>
            {expenses.length > 0 ? (
              <div className="space-y-4">
                {expenses.map((expense) => (
                  <div
                    key={expense._id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{expense.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Paid by {expense.paidBy?.name || 'Unknown'}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {expense.splitDetails?.map((detail, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-1 bg-gray-100 rounded"
                            >
                              {detail.user?.name}: ₹{detail.amount?.toFixed(2)}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary-600">
                          ₹{expense.amount?.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(expense.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No expenses yet</p>
            )}
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold flex items-center mb-4">
              <Activity className="w-5 h-5 mr-2" />
              Recent Activity
            </h2>
            {activities.length > 0 ? (
              <div className="space-y-3">
                {activities.slice(0, 10).map((activity, idx) => (
                  <div key={idx} className="text-sm text-gray-600 border-b pb-2 last:border-0">
                    {activity.message || activity.description}
                    <span className="text-gray-400 ml-2">
                      {new Date(activity.createdAt || activity.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No activity yet</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Members</h3>
              <button
                onClick={() => setShowAddMembersModal(true)}
                className="btn btn-primary text-sm flex items-center"
              >
                <UserPlus className="w-4 h-4 mr-1" />
                Add Members
              </button>
            </div>
            <div className="space-y-2">
              {group.members?.map((member) => (
                <div
                  key={member._id || member}
                  className="flex items-center p-2 bg-gray-50 rounded-lg"
                >
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                    {member.name?.charAt(0).toUpperCase() || member.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{member.name || 'Unknown'}</p>
                    {member.email && (
                      <p className="text-xs text-gray-500">{member.email}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-3">
              {group.members?.length || 0} member{group.members?.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {showExpenseModal && (
        <CreateExpenseModal
          groupId={groupId}
          onClose={() => setShowExpenseModal(false)}
          onSuccess={handleExpenseCreated}
        />
      )}

      {showChat && (
        <ChatPanel groupId={groupId} onClose={() => setShowChat(false)} />
      )}

      {showAddMembersModal && (
        <AddMembersModal
          groupId={groupId}
          currentMembers={group.members || []}
          onClose={() => setShowAddMembersModal(false)}
          onSuccess={handleMembersAdded}
        />
      )}
    </div>
  )
}

export default GroupDetail
