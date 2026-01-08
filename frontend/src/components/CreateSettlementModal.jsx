import { useState, useEffect } from 'react'
import { settlementAPI, groupAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { X } from 'lucide-react'

const CreateSettlementModal = ({ onClose, onSuccess }) => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    paidBy: '',
    paidTo: '',
    amount: '',
    description: '',
  })
  const [allUsers, setAllUsers] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Fetch users from groups (simplified - you might want a users API)
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      // This is a simplified approach - you might want to create a users API endpoint
      const groups = await groupAPI.getAll()
      const usersSet = new Set()
      groups.data.forEach((group) => {
        group.members?.forEach((member) => {
          if (member._id) usersSet.add(JSON.stringify(member))
        })
      })
      setAllUsers(Array.from(usersSet).map((u) => JSON.parse(u)))
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await settlementAPI.create({
        ...formData,
        amount: parseFloat(formData.amount),
      })
      toast.success('Settlement recorded successfully!')
      onSuccess()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record settlement')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Record Settlement</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              <option value="">Select payer</option>
              {allUsers.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name || u.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paid To *
            </label>
            <select
              value={formData.paidTo}
              onChange={(e) => setFormData({ ...formData, paidTo: e.target.value })}
              required
              className="input"
            >
              <option value="">Select recipient</option>
              {allUsers
                .filter((u) => u._id !== formData.paidBy)
                .map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name || u.email}
                  </option>
                ))}
            </select>
          </div>

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
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input"
              rows={3}
              placeholder="Optional description"
            />
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
              {loading ? 'Recording...' : 'Record Settlement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateSettlementModal
