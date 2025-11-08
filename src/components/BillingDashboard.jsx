import React, { useState, useEffect } from 'react'
import { 
  DollarSign, Search, Filter, Calendar, User, CreditCard, 
  CheckCircle, Clock, XCircle, Download, Eye, TrendingUp,
  FileText, AlertCircle
} from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import BillDetailsModal from './BillDetailsModal'

const BillingDashboard = ({ doctorId }) => {
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedBill, setSelectedBill] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [stats, setStats] = useState({
    totalBills: 0,
    paidAmount: 0,
    pendingAmount: 0,
    overdueAmount: 0
  })

  useEffect(() => {
    fetchBills()
  }, [doctorId])

  const fetchBills = async () => {
    try {
      setLoading(true)
      
      // Fetch all bills (or filter by doctor_id if needed)
      const { data, error } = await supabase
        .from('opbilling')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching bills:', error)
        return
      }

      console.log('✅ Fetched bills:', data?.length || 0)
      setBills(data || [])
      
      // Calculate statistics
      const totalBills = data?.length || 0
      const paidAmount = data?.reduce((sum, bill) => 
        sum + (bill.payment_status === 'paid' ? bill.paid_amount : 0), 0) || 0
      const pendingAmount = data?.reduce((sum, bill) => 
        sum + (bill.payment_status === 'pending' ? bill.balance_due : 0), 0) || 0
      
      // Calculate overdue amount (bills past due date and still pending)
      const today = new Date().toISOString().split('T')[0]
      const overdueAmount = data?.reduce((sum, bill) => {
        if (bill.payment_status === 'pending' && bill.due_date < today) {
          return sum + bill.balance_due
        }
        return sum
      }, 0) || 0
      
      setStats({
        totalBills,
        paidAmount,
        pendingAmount,
        overdueAmount
      })
      
    } catch (err) {
      console.error('Error in fetchBills:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (bill) => {
    setSelectedBill(bill)
    setShowDetailsModal(true)
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-700'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700'
      case 'partially_paid':
        return 'bg-blue-100 text-blue-700'
      case 'cancelled':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return <CheckCircle className="w-4 h-4" />
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'cancelled':
        return <XCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const isOverdue = (bill) => {
    if (bill.payment_status === 'paid') return false
    const today = new Date().toISOString().split('T')[0]
    return bill.due_date < today
  }

  const filteredBills = bills.filter(bill => {
    // Filter by status
    if (filterStatus !== 'all' && bill.payment_status !== filterStatus) {
      return false
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      return (
        bill.bill_number?.toLowerCase().includes(query) ||
        bill.patient_mrno?.toLowerCase().includes(query) ||
        bill.service_name?.toLowerCase().includes(query) ||
        bill.doctor_name?.toLowerCase().includes(query)
      )
    }
    
    return true
  })

  const StatCard = ({ icon: Icon, title, value, color, prefix = '' }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>
        <div className={`p-4 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={FileText}
          title="Total Bills"
          value={stats.totalBills}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatCard
          icon={CheckCircle}
          title="Paid Amount"
          value={stats.paidAmount}
          prefix="₹"
          color="bg-gradient-to-br from-green-500 to-green-600"
        />
        <StatCard
          icon={Clock}
          title="Pending Amount"
          value={stats.pendingAmount}
          prefix="₹"
          color="bg-gradient-to-br from-yellow-500 to-yellow-600"
        />
        <StatCard
          icon={AlertCircle}
          title="Overdue Amount"
          value={stats.overdueAmount}
          prefix="₹"
          color="bg-gradient-to-br from-red-500 to-red-600"
        />
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by bill number, patient ID, service name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cura-primary focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cura-primary focus:border-transparent outline-none"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Bills Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cura-primary"></div>
          </div>
        ) : filteredBills.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Bill Number</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Patient ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Service</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Bill Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Paid</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Balance</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.map((bill) => (
                  <tr 
                    key={bill.opbill_id} 
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      isOverdue(bill) ? 'bg-red-50' : ''
                    }`}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{bill.bill_number}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{bill.patient_mrno?.substring(0, 8)}...</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{bill.service_name}</p>
                        <p className="text-xs text-gray-500">{bill.service_category}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{bill.bill_date}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-gray-900">₹{bill.total_amount}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-green-600 font-medium">₹{bill.paid_amount}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`text-sm font-medium ${
                        bill.balance_due > 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        ₹{bill.balance_due}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(bill.payment_status)}`}>
                        {getStatusIcon(bill.payment_status)}
                        {bill.payment_status}
                      </span>
                      {isOverdue(bill) && (
                        <span className="block mt-1 text-xs text-red-600 font-medium">Overdue</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleViewDetails(bill)}
                        className="flex items-center gap-1 px-3 py-1 text-sm text-cura-primary hover:text-cura-secondary font-medium transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-lg text-gray-600 font-medium">No bills found</p>
            <p className="text-sm text-gray-500 mt-2">
              {searchQuery || filterStatus !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Bills will appear here once created'}
            </p>
          </div>
        )}
      </div>

      {/* Bill Details Modal */}
      {showDetailsModal && selectedBill && (
        <BillDetailsModal
          bill={selectedBill}
          onClose={() => {
            setShowDetailsModal(false)
            setSelectedBill(null)
          }}
          onUpdate={fetchBills}
        />
      )}
    </div>
  )
}

export default BillingDashboard
