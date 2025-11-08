import React from 'react'
import { 
  X, FileText, User, Calendar, DollarSign, CreditCard, 
  CheckCircle, Clock, AlertCircle, Download, Printer,
  Building, Stethoscope, Package, Receipt
} from 'lucide-react'

const BillDetailsModal = ({ bill, onClose, onUpdate }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleString('en-IN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'partially_paid':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // In a real application, this would generate a PDF
    alert('PDF download functionality would be implemented here')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-cura-primary to-cura-secondary text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Receipt className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Bill Details</h2>
              <p className="text-sm opacity-90">{bill.bill_number}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              title="Print"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              title="Download PDF"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border-2 ${getStatusColor(bill.payment_status)}`}>
              {bill.payment_status === 'paid' && <CheckCircle className="w-5 h-5" />}
              {bill.payment_status === 'pending' && <Clock className="w-5 h-5" />}
              {bill.payment_status === 'cancelled' && <AlertCircle className="w-5 h-5" />}
              {bill.payment_status?.toUpperCase()}
            </span>
            {bill.bill_status && (
              <span className="text-sm text-gray-600">
                Bill Status: <span className="font-medium">{bill.bill_status}</span>
              </span>
            )}
          </div>

          {/* Patient & Appointment Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5 text-cura-primary" />
                Patient Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Patient MR No:</span>
                  <span className="font-medium text-gray-900">{bill.patient_mrno}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Appointment ID:</span>
                  <span className="font-medium text-gray-900 text-xs">{bill.appointment_id?.substring(0, 20)}...</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cura-primary" />
                Date Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Bill Date:</span>
                  <span className="font-medium text-gray-900">{formatDate(bill.bill_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Service Date:</span>
                  <span className="font-medium text-gray-900">{formatDate(bill.service_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Due Date:</span>
                  <span className="font-medium text-gray-900">{formatDate(bill.due_date)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="bg-blue-50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-cura-primary" />
              Service Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Service Name:</span>
                <span className="font-medium text-gray-900">{bill.service_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Category:</span>
                <span className="font-medium text-gray-900">{bill.service_category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Department:</span>
                <span className="font-medium text-gray-900">{bill.billing_department}</span>
              </div>
              {bill.service_code && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Service Code:</span>
                  <span className="font-medium text-gray-900">{bill.service_code}</span>
                </div>
              )}
            </div>
            {bill.service_description && (
              <div className="pt-2 border-t border-blue-200">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Description:</span> {bill.service_description}
                </p>
              </div>
            )}
          </div>

          {/* Doctor Information */}
          {(bill.doctor_id || bill.doctor_name) && (
            <div className="bg-purple-50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-cura-primary" />
                Doctor Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {bill.doctor_id && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Doctor ID:</span>
                    <span className="font-medium text-gray-900">{bill.doctor_id}</span>
                  </div>
                )}
                {bill.doctor_name && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Doctor Name:</span>
                    <span className="font-medium text-gray-900">{bill.doctor_name}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Billing Breakdown */}
          <div className="bg-green-50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-cura-primary" />
              Billing Breakdown
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Unit Price:</span>
                <span className="font-medium text-gray-900">₹{bill.unit_price}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Quantity:</span>
                <span className="font-medium text-gray-900">{bill.quantity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium text-gray-900">₹{bill.subtotal}</span>
              </div>
              
              {bill.discount_percent > 0 && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount ({bill.discount_percent}%):</span>
                    <span className="font-medium text-red-600">-₹{bill.discount_amount}</span>
                  </div>
                </>
              )}
              
              {bill.tax_percent > 0 && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax ({bill.tax_percent}%):</span>
                    <span className="font-medium text-gray-900">₹{bill.tax_amount}</span>
                  </div>
                </>
              )}
              
              <div className="border-t border-green-200 pt-2 mt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-gray-900">Total Amount:</span>
                  <span className="text-green-600">₹{bill.total_amount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-yellow-50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-cura-primary" />
              Payment Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Paid Amount:</span>
                <span className="font-semibold text-green-600">₹{bill.paid_amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Balance Due:</span>
                <span className={`font-semibold ${bill.balance_due > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                  ₹{bill.balance_due}
                </span>
              </div>
              {bill.payment_method && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium text-gray-900 capitalize">{bill.payment_method}</span>
                </div>
              )}
              {bill.payment_transaction_id && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-medium text-gray-900 text-xs">{bill.payment_transaction_id}</span>
                </div>
              )}
              {bill.paid_date && (
                <div className="flex justify-between md:col-span-2">
                  <span className="text-gray-600">Paid Date:</span>
                  <span className="font-medium text-gray-900">{formatDateTime(bill.paid_date)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Staff Information */}
          {bill.created_by_staff_name && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Building className="w-5 h-5 text-cura-primary" />
                Staff Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Created By:</span>
                  <span className="font-medium text-gray-900">{bill.created_by_staff_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created At:</span>
                  <span className="font-medium text-gray-900">{formatDateTime(bill.created_at)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {(bill.notes || bill.internal_notes) && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-cura-primary" />
                Notes
              </h3>
              {bill.notes && (
                <div className="text-sm">
                  <p className="text-gray-600 font-medium mb-1">Notes:</p>
                  <p className="text-gray-900">{bill.notes}</p>
                </div>
              )}
              {bill.internal_notes && (
                <div className="text-sm">
                  <p className="text-gray-600 font-medium mb-1">Internal Notes:</p>
                  <p className="text-gray-900">{bill.internal_notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Cancellation Information */}
          {bill.bill_status === 'cancelled' && (
            <div className="bg-red-50 rounded-lg p-4 space-y-3 border-2 border-red-200">
              <h3 className="font-semibold text-red-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Cancellation Information
              </h3>
              <div className="space-y-2 text-sm">
                {bill.cancellation_reason && (
                  <div>
                    <span className="text-gray-600">Reason:</span>
                    <p className="font-medium text-gray-900 mt-1">{bill.cancellation_reason}</p>
                  </div>
                )}
                {bill.cancelled_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cancelled At:</span>
                    <span className="font-medium text-gray-900">{formatDateTime(bill.cancelled_at)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-100 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default BillDetailsModal
