import { useState, useEffect } from 'react'
import { expenseAPI, groupAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { X } from 'lucide-react'

const CreateExpenseModal = ({ groupId, onClose, onSuccess }) => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    paidBy: '',
    participants: [],
    splitType: 'equal',
    splitDetails: [],
  })
  const [groupMembers, setGroupMembers] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchGroupMembers()
  }, [groupId])

  const fetchGroupMembers = async () => {
    try {
      const response = await groupAPI.getById(groupId)
      setGroupMembers(response.data.members || [])
      if (user?.id) {
        setFormData((prev) => ({ ...prev, paidBy: user.id }))
      }
    } catch (error) {
      console.error('Error fetching group members:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const expenseData = {
        ...formData,
        amount: parseFloat(formData.amount),
        groupId: groupId,
        participants: formData.participants.length > 0 
          ? formData.participants 
          : groupMembers.map(m => m._id || m),
      }

      await expenseAPI.create(expenseData)
      toast.success('Expense created successfully!')
      onSuccess()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create expense')
    } finally {
      setLoading(false)
    }
  }

  const toggleParticipant = (memberId) => {
    setFormData((prev) => ({
      ...prev,
      participants: prev.participants.includes(memberId)
        ? prev.participants.filter((id) => id !== memberId)
        : [...prev.participants, memberId],
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Add Expense</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              minLength={3}
              className="input"
              placeholder="e.g., Dinner, Groceries"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                min="0.01"
                className="input"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paid By *
              </label>
              <select
                value={formData.paidBy}
                onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                required
                className="input"
              >
                <option value="">Select member</option>
                {groupMembers.map((member) => (
                  <option key={member._id || member} value={member._id || member}>
                    {member.name || member.email || 'Unknown'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Split Type *
            </label>
            <select
              value={formData.splitType}
              onChange={(e) => setFormData({ ...formData, splitType: e.target.value })}
              className="input"
            >
              <option value="equal">Equal</option>
              <option value="unequal">Unequal</option>
              <option value="percentage">Percentage</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Participants
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3">
              {groupMembers.map((member) => (
                <label
                  key={member._id || member}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={formData.participants.includes(member._id || member)}
                    onChange={() => toggleParticipant(member._id || member)}
                    className="rounded"
                  />
                  <span>{member.name || member.email || 'Unknown'}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateExpenseModal
