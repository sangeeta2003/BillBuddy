import { useEffect, useState } from 'react'
import { expenseAPI } from '../services/api'
import { Plus, Search, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const Expenses = () => {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    try {
      const response = await expenseAPI.getAll()
      setExpenses(response.data)
    } catch (error) {
      toast.error('Failed to load expenses')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return

    try {
      await expenseAPI.delete(id)
      toast.success('Expense deleted successfully')
      fetchExpenses()
    } catch (error) {
      toast.error('Failed to delete expense')
    }
  }

  const filteredExpenses = expenses.filter((expense) =>
    expense.title?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-600 mt-1">View and manage all expenses</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search expenses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input pl-10"
        />
      </div>

      {filteredExpenses.length > 0 ? (
        <div className="space-y-4">
          {filteredExpenses.map((expense) => (
            <div key={expense._id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold">{expense.title}</h3>
                    <button
                      onClick={() => handleDelete(expense._id)}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-gray-600">
                    Paid by <span className="font-medium">{expense.paidBy?.name || 'Unknown'}</span>
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {expense.splitDetails?.map((detail, idx) => (
                      <span
                        key={idx}
                        className="text-sm px-3 py-1 bg-gray-100 rounded-full"
                      >
                        {detail.user?.name || 'Unknown'}: ₹{detail.amount?.toFixed(2)}
                        {detail.status === 'paid' && (
                          <span className="ml-2 text-green-600">✓</span>
                        )}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-3">
                    {format(new Date(expense.createdAt), 'PPp')}
                  </p>
                </div>
                <div className="ml-4 text-right">
                  <p className="text-2xl font-bold text-primary-600">
                    ₹{expense.amount?.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1 capitalize">{expense.splitType}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-gray-600">
            {searchTerm ? 'No expenses found matching your search' : 'No expenses yet'}
          </p>
        </div>
      )}
    </div>
  )
}

export default Expenses
