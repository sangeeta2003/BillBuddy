import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { balanceAPI } from '../services/api'
import { Wallet, ArrowUp, ArrowDown } from 'lucide-react'
import toast from 'react-hot-toast'

const Balance = () => {
  const { user } = useAuth()
  const [balance, setBalance] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      fetchBalance()
    }
  }, [user])

  const fetchBalance = async () => {
    try {
      const response = await balanceAPI.getUserBalance(user.id)
      setBalance(response.data)
    } catch (error) {
      toast.error('Failed to load balance')
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
        <h1 className="text-3xl font-bold text-gray-900">Balance</h1>
        <p className="text-gray-600 mt-1">Your expense balance overview</p>
      </div>

      {balance && (
        <>
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Net Balance</h2>
              <Wallet className="w-8 h-8 text-primary-600" />
            </div>
            <div className="text-center">
              <p
                className={`text-4xl font-bold ${
                  balance.net >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {balance.net >= 0 ? '+' : ''}₹{Math.abs(balance.net)?.toFixed(2) || '0.00'}
              </p>
              <p className="text-gray-600 mt-2">
                {balance.net >= 0 ? 'You are owed' : 'You owe'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">You Owe</h3>
                <ArrowDown className="w-6 h-6 text-red-600" />
              </div>
              {balance.owes && balance.owes.length > 0 ? (
                <div className="space-y-3">
                  {balance.owes.map((owe, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-red-50 rounded-lg border border-red-200"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{owe.to}</p>
                          <p className="text-sm text-gray-600">{owe.expense}</p>
                        </div>
                        <p className="text-lg font-bold text-red-600">
                          ₹{owe.amount?.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Nothing to pay!</p>
              )}
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">You Are Owed</h3>
                <ArrowUp className="w-6 h-6 text-green-600" />
              </div>
              {balance.owedBy && balance.owedBy.length > 0 ? (
                <div className="space-y-3">
                  {balance.owedBy.map((owed, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-green-50 rounded-lg border border-green-200"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{owed.from}</p>
                          <p className="text-sm text-gray-600">{owed.expense}</p>
                        </div>
                        <p className="text-lg font-bold text-green-600">
                          ₹{owed.amount?.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No pending payments</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Balance
