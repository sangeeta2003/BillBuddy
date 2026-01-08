import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { settlementAPI } from '../services/api'
import { Plus, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import CreateSettlementModal from '../components/CreateSettlementModal'
import { format } from 'date-fns'

const Settlements = () => {
  const { user } = useAuth()
  const [settlements, setSettlements] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    if (user?.id) {
      fetchSettlements()
    }
  }, [user])

  const fetchSettlements = async () => {
    try {
      const response = await settlementAPI.getUserSettlements(user.id)
      setSettlements(response.data)
    } catch (error) {
      toast.error('Failed to load settlements')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSettlementCreated = () => {
    fetchSettlements()
    setShowCreateModal(false)
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settlements</h1>
          <p className="text-gray-600 mt-1">Track your expense settlements</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Record Settlement
        </button>
      </div>

      {settlements.length > 0 ? (
        <div className="space-y-4">
          {settlements.map((settlement) => (
            <div key={settlement._id} className="card">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <h3 className="font-semibold text-lg">
                        {settlement.paidBy?._id === user?.id
                          ? `You paid ${settlement.paidTo?.name || 'Unknown'}`
                          : `${settlement.paidBy?.name || 'Unknown'} paid you`}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {settlement.description || 'Settlement payment'}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    {format(new Date(settlement.createdAt), 'PPp')}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-2xl font-bold ${
                      settlement.paidBy?._id === user?.id ? 'text-red-600' : 'text-green-600'
                    }`}
                  >
                    {settlement.paidBy?._id === user?.id ? '-' : '+'}₹
                    {settlement.amount?.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {settlement.status || 'completed'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No settlements yet</h3>
          <p className="text-gray-600 mb-4">
            Record a settlement when you pay or receive money
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            Record Settlement
          </button>
        </div>
      )}

      {showCreateModal && (
        <CreateSettlementModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleSettlementCreated}
        />
      )}
    </div>
  )
}

export default Settlements
