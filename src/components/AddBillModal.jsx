import React, { useState, useEffect } from 'react'
import { 
  X, Plus, DollarSign, User, Calendar, Package, 
  Building, Stethoscope, FileText, AlertCircle, CheckCircle
} from 'lucide-react'
import { supabase } from '../lib/supabaseClient'

const AddBillModal = ({ onClose, onBillCreated, prefilledPatientId = '' }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [appointments, setAppointments] = useState([])
  const [doctors, setDoctors] = useState([])
  
  // Form state
  const [formData, setFormData] = useState({
    appointment_id: '',
    patient_mrno: prefilledPatientId,
    service_category: 'consultation',
    service_name: '',
    service_description: '',
    billing_department: 'OPD',
    doctor_id: '',
    doctor_name: '',
    unit_price: '',
    quantity: 1,
    discount_percent: 0,
    tax_percent: 0,
    payment_status: 'pending',
    payment_method: '',
    due_date: '',
    notes: ''
  })

  useEffect(() => {
    fetchAppointments()
    fetchDoctors()
  }, [prefilledPatientId])

  const fetchDoctors = async () => {
    try {
      console.log('Fetching doctors...')
      const { data, error } = await supabase
        .from('doctors')
        .select('doctor_id, name, department, specialization')
        .order('name', { ascending: true })
      
      if (error) {
        console.error('Error fetching doctors:', error)
        throw error
      }
      console.log('Fetched doctors:', data?.length || 0)
      setDoctors(data || [])
    } catch (err) {
      console.error('Error fetching doctors:', err)
    }
  }

  const fetchAppointments = async () => {
    try {
      console.log('Fetching appointments for dropdown...', prefilledPatientId ? `for patient: ${prefilledPatientId}` : 'all')
      
      let query = supabase
        .from('appointments')
        .select('appointment_id, mrno, patient_name, date, doctor_id')
        .order('date', { ascending: false })
      
      // If prefilledPatientId is provided, filter appointments for that patient only
      if (prefilledPatientId) {
        query = query.eq('mrno', prefilledPatientId)
      } else {
        query = query.limit(50)
      }
      
      const { data, error } = await query
      
      if (error) {
        console.error('Error fetching appointments:', error)
        throw error
      }
      console.log('Fetched appointments:', data?.length || 0)
      setAppointments(data || [])
    } catch (err) {
      console.error('Error fetching appointments:', err)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleDoctorSelect = (e) => {
    const doctorId = e.target.value
    const doctor = doctors.find(doc => doc.doctor_id === parseInt(doctorId))
    
    console.log('Selected doctor:', doctor)
    
    if (doctor) {
      setFormData(prev => ({
        ...prev,
        doctor_id: doctor.doctor_id,
        doctor_name: doctor.name
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        doctor_id: '',
        doctor_name: ''
      }))
    }
  }

  const handleAppointmentSelect = (e) => {
    const appointmentId = e.target.value
    const appointment = appointments.find(apt => apt.appointment_id === appointmentId)
    
    console.log('Selected appointment:', appointment)
    
    if (appointment) {
      setFormData(prev => ({
        ...prev,
        appointment_id: appointmentId,
        patient_mrno: appointment.mrno || '',
        doctor_id: appointment.doctor_id || ''
      }))
    }
  }

  const calculateAmounts = () => {
    const unitPrice = parseFloat(formData.unit_price) || 0
    const quantity = parseInt(formData.quantity) || 1
    const discountPercent = parseFloat(formData.discount_percent) || 0
    const taxPercent = parseFloat(formData.tax_percent) || 0

    const subtotal = unitPrice * quantity
    const discountAmount = (subtotal * discountPercent) / 100
    const afterDiscount = subtotal - discountAmount
    const taxAmount = (afterDiscount * taxPercent) / 100
    const totalAmount = afterDiscount + taxAmount

    return {
      subtotal: subtotal.toFixed(2),
      discount_amount: discountAmount.toFixed(2),
      tax_amount: taxAmount.toFixed(2),
      total_amount: totalAmount.toFixed(2)
    }
  }

  const generateBillNumber = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const random = String(Math.floor(Math.random() * 10000)).padStart(5, '0')
    return `OPB-${year}-${month}-${day}-${random}`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Validate required fields
      if (!formData.patient_mrno || !formData.service_name || !formData.unit_price) {
        setError('Please fill in all required fields')
        setLoading(false)
        return
      }

      const amounts = calculateAmounts()
      const today = new Date().toISOString().split('T')[0]
      const dueDate = formData.due_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      const billData = {
        bill_number: generateBillNumber(),
        patient_mrno: formData.patient_mrno,
        appointment_id: formData.appointment_id || null,
        service_category: formData.service_category,
        service_name: formData.service_name,
        service_description: formData.service_description || null,
        billing_department: formData.billing_department,
        doctor_id: formData.doctor_id ? parseInt(formData.doctor_id) : null,
        doctor_name: formData.doctor_name || null,
        created_by_staff_name: 'Doctor Portal',
        unit_price: parseFloat(formData.unit_price),
        quantity: parseInt(formData.quantity),
        discount_percent: parseFloat(formData.discount_percent) || 0,
        tax_percent: parseFloat(formData.tax_percent) || 0,
        // All amount fields (subtotal, discount_amount, tax_amount, total_amount, balance_due) 
        // are auto-calculated by database based on unit_price, quantity, discount_percent, tax_percent
        paid_amount: 0,
        payment_status: formData.payment_status,
        payment_method: formData.payment_method || null,
        due_date: dueDate,
        bill_status: 'active',
        bill_date: today,
        service_date: today,
        notes: formData.notes || null
      }

      const { data, error: insertError } = await supabase
        .from('opbilling')
        .insert([billData])
        .select()

      if (insertError) throw insertError

      setSuccess('Bill created successfully!')
      setTimeout(() => {
        onBillCreated()
        onClose()
      }, 1500)

    } catch (err) {
      console.error('Error creating bill:', err)
      setError(err.message || 'Failed to create bill. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const amounts = calculateAmounts()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-cura-primary to-cura-secondary text-white p-6 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Create New Bill</h2>
              <p className="text-sm opacity-90">Add a new billing entry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 font-medium">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800 font-medium">{success}</p>
            </div>
          )}

          {/* Patient & Appointment Information */}
          <div className="bg-blue-50 rounded-xl p-4 space-y-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5 text-cura-primary" />
              Patient & Appointment Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Appointment (Optional)
                </label>
                <select
                  name="appointment_id"
                  value={formData.appointment_id}
                  onChange={handleAppointmentSelect}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-cura-primary focus:border-cura-primary outline-none transition-all"
                >
                  <option value="">Select an appointment</option>
                  {appointments.map(apt => (
                    <option key={apt.appointment_id} value={apt.appointment_id}>
                      {apt.patient_name} - {apt.date}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Patient MR No <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="patient_mrno"
                  value={formData.patient_mrno}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-cura-primary focus:border-cura-primary outline-none transition-all"
                  placeholder="Enter patient MR number"
                  required
                />
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="bg-purple-50 rounded-xl p-4 space-y-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-cura-primary" />
              Service Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Service Category
                </label>
                <select
                  name="service_category"
                  value={formData.service_category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-cura-primary focus:border-cura-primary outline-none transition-all"
                >
                  <option value="consultation">Consultation</option>
                  <option value="procedure">Procedure</option>
                  <option value="laboratory">Laboratory</option>
                  <option value="radiology">Radiology</option>
                  <option value="pharmacy">Pharmacy</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Service Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="service_name"
                  value={formData.service_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-cura-primary focus:border-cura-primary outline-none transition-all"
                  placeholder="e.g., Doctor Consultation"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Service Description
                </label>
                <textarea
                  name="service_description"
                  value={formData.service_description}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-cura-primary focus:border-cura-primary outline-none transition-all"
                  placeholder="Additional details about the service"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Department
                </label>
                <select
                  name="billing_department"
                  value={formData.billing_department}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-cura-primary focus:border-cura-primary outline-none transition-all"
                >
                  <option value="OPD">OPD</option>
                  <option value="IPD">IPD</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Laboratory">Laboratory</option>
                  <option value="Radiology">Radiology</option>
                  <option value="Pharmacy">Pharmacy</option>
                </select>
              </div>
            </div>
          </div>

          {/* Doctor Information */}
          <div className="bg-green-50 rounded-xl p-4 space-y-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-cura-primary" />
              Doctor Information (Optional)
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Doctor
                </label>
                <select
                  value={formData.doctor_id}
                  onChange={handleDoctorSelect}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-cura-primary focus:border-cura-primary outline-none transition-all"
                >
                  <option value="">Select a doctor (optional)</option>
                  {doctors.map(doctor => (
                    <option key={doctor.doctor_id} value={doctor.doctor_id}>
                      Dr. {doctor.name} - {doctor.specialization || doctor.department}
                    </option>
                  ))}
                </select>
              </div>

              {formData.doctor_name && (
                <div className="bg-white rounded-lg p-3 border-2 border-green-200">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Doctor ID:</span>
                      <p className="font-semibold text-gray-900">{formData.doctor_id}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Doctor Name:</span>
                      <p className="font-semibold text-gray-900">Dr. {formData.doctor_name}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pricing Details */}
          <div className="bg-yellow-50 rounded-xl p-4 space-y-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-cura-primary" />
              Pricing Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Unit Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="unit_price"
                  value={formData.unit_price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-cura-primary focus:border-cura-primary outline-none transition-all"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-cura-primary focus:border-cura-primary outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Discount (%)
                </label>
                <input
                  type="number"
                  name="discount_percent"
                  value={formData.discount_percent}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  max="100"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-cura-primary focus:border-cura-primary outline-none transition-all"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tax (%)
                </label>
                <input
                  type="number"
                  name="tax_percent"
                  value={formData.tax_percent}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  max="100"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-cura-primary focus:border-cura-primary outline-none transition-all"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Amount Breakdown */}
            <div className="bg-white rounded-lg p-4 space-y-2 border-2 border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold">₹{amounts.subtotal}</span>
              </div>
              {parseFloat(amounts.discount_amount) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount:</span>
                  <span className="font-semibold text-red-600">-₹{amounts.discount_amount}</span>
                </div>
              )}
              {parseFloat(amounts.tax_amount) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-semibold">₹{amounts.tax_amount}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t-2 border-gray-200 pt-2">
                <span className="text-gray-900">Total Amount:</span>
                <span className="text-green-600">₹{amounts.total_amount}</span>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-orange-50 rounded-xl p-4 space-y-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cura-primary" />
              Payment Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Payment Status
                </label>
                <select
                  name="payment_status"
                  value={formData.payment_status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-cura-primary focus:border-cura-primary outline-none transition-all"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="partially_paid">Partially Paid</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-cura-primary focus:border-cura-primary outline-none transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-cura-primary focus:border-cura-primary outline-none transition-all"
                  placeholder="Additional notes or comments"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-cura-primary to-cura-secondary text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Create Bill
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddBillModal
