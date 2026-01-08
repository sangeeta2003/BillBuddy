import { useState, useEffect } from 'react'
import { groupAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { X, UserPlus, Search } from 'lucide-react'

const AddMembersModal = ({ groupId, currentMembers, onClose, onSuccess }) => {
  const { user } = useAuth()
  const [allUsers, setAllUsers] = useState([])
  const [selectedMembers, setSelectedMembers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchingUsers, setFetchingUsers] = useState(true)

  useEffect(() => {
    fetchAllUsers()
  }, [])

  const fetchAllUsers = async () => {
    try {
      // Get all groups to extract unique users
      const groupsResponse = await groupAPI.getAll()
      const usersSet = new Set()
      
      groupsResponse.data.forEach((group) => {
        group.members?.forEach((member) => {
          if (member._id) {
            usersSet.add(JSON.stringify({
              _id: member._id,
              name: member.name,
              email: member.email
            }))
          }
        })
      })
      
      const users = Array.from(usersSet).map((u) => JSON.parse(u))
      
      // Filter out current members and current user
      const currentMemberIds = currentMembers.map(m => (m._id || m).toString())
      const filteredUsers = users.filter(u => 
        !currentMemberIds.includes(u._id.toString()) &&
        u._id.toString() !== user?.id?.toString()
      )
      
      setAllUsers(filteredUsers)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
    } finally {
      setFetchingUsers(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (selectedMembers.length === 0) {
      toast.error('Please select at least one member to add')
      return
    }

    setLoading(true)

    try {
      await groupAPI.addMembers({
        groupId,
        members: selectedMembers,
      })
      toast.success('Members added successfully!')
      onSuccess()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add members')
    } finally {
      setLoading(false)
    }
  }

  const toggleMember = (userId) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    )
  }

  const filteredUsers = allUsers.filter((u) =>
    (u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     u.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-md w-full p-6 my-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <UserPlus className="w-6 h-6 text-primary-600 mr-2" />
            <h2 className="text-2xl font-bold">Add Members</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>

            {fetchingUsers ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading users...</p>
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-300 rounded-lg p-3">
                {filteredUsers.map((user) => (
                  <label
                    key={user._id}
                    className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(user._id)}
                      onChange={() => toggleMember(user._id)}
                      className="rounded"
                    />
                    <div className="flex items-center flex-1">
                      <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                        {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-medium">{user.name || 'Unknown'}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'No users found matching your search' : 'No users available to add'}
              </div>
            )}
          </div>

          {selectedMembers.length > 0 && (
            <div className="bg-primary-50 p-3 rounded-lg">
              <p className="text-sm text-primary-700">
                {selectedMembers.length} member{selectedMembers.length > 1 ? 's' : ''} selected
              </p>
            </div>
          )}

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
              disabled={loading || selectedMembers.length === 0}
            >
              {loading ? 'Adding...' : `Add ${selectedMembers.length > 0 ? `${selectedMembers.length} ` : ''}Member${selectedMembers.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddMembersModal
