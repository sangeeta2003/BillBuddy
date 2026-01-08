import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { groupAPI } from '../services/api'
import { Link } from 'react-router-dom'
import { Plus, Users, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import CreateGroupModal from '../components/CreateGroupModal'

const Groups = () => {
  const { user } = useAuth()
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchGroups()
  }, [user])

  const fetchGroups = async () => {
    try {
      if (user?.id) {
        const response = await groupAPI.getUserGroups(user.id)
        setGroups(response.data)
      }
    } catch (error) {
      toast.error('Failed to load groups')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleGroupCreated = () => {
    fetchGroups()
    setShowCreateModal(false)
  }

  const filteredGroups = groups.filter((group) =>
    group.groupname?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Groups</h1>
          <p className="text-gray-600 mt-1">Manage your expense groups</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Group
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search groups..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input pl-10"
        />
      </div>

      {filteredGroups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <Link
              key={group._id}
              to={`/groups/${group._id}`}
              className="card hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="p-2 bg-primary-100 rounded-lg mr-3">
                    <Users className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{group.groupname}</h3>
                    <p className="text-sm text-gray-500">
                      {group.members?.length || 0} members
                    </p>
                  </div>
                </div>
              </div>
              {group.description && (
                <p className="text-sm text-gray-600 line-clamp-2">{group.description}</p>
              )}
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-500">
                  Created {new Date(group.createdAt).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No groups found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'Try a different search term' : 'Create your first group to get started'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
            >
              Create Group
            </button>
          )}
        </div>
      )}

      {showCreateModal && (
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleGroupCreated}
        />
      )}
    </div>
  )
}

export default Groups
