import { useState } from 'react'
import { groupAPI } from '../services/api'
import toast from 'react-hot-toast'
import { X } from 'lucide-react'

const CreateGroupModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    groupname: '',
    description: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await groupAPI.create(formData)
      toast.success(response.data?.message || 'Group created successfully!')
      onSuccess()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create group')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Create New Group</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="groupname" className="block text-sm font-medium text-gray-700 mb-2">
              Group Name *
            </label>
            <input
              id="groupname"
              type="text"
              value={formData.groupname}
              onChange={(e) => setFormData({ ...formData, groupname: e.target.value })}
              required
              minLength={3}
              className="input"
              placeholder="e.g., Roommates, Friends Trip"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
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
              {loading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateGroupModal
