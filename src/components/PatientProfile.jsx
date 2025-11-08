import React, { useState, useEffect } from 'react'
import { 
  User, Calendar, Phone, Mail, MapPin, Activity, 
  FileText, DollarSign, Clock, ArrowLeft, Plus,
  Stethoscope, AlertCircle, CheckCircle, Edit
} from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import AddBillModal from './AddBillModal'
import BillDetailsModal from './BillDetailsModal'

const PatientProfile = ({ patientId, onBack }) => {
  const [patient, setPatient] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showAddBillModal, setShowAddBillModal] = useState(false)
  const [showBillDetailsModal, setShowBillDetailsModal] = useState(false)
  const [selectedBill, setSelectedBill] = useState(null)

  useEffect(() => {
    if (patientId) {
      fetchPatientData()
    }
  }, [patientId])

  const fetchPatientData = async () => {
    try {
      setLoading(true)
      
      // Fetch appointments to get patient info
      const { data: appointmentData, error: aptError } = await supabase
        .from('appointments')
        .select('*')
        .eq('mrno', patientId)
        .order('date', { ascending: false })
      
      if (aptError) throw aptError

      // Get patient info from first appointment
      if (appointmentData && appointmentData.length > 0) {
        const firstApt = appointmentData[0]
        let patientInfo = {
          patient_id: patientId,
          patient_name: firstApt.patient_name || 'Unknown Patient',
          email: firstApt.patient_email || 'N/A',
          phone: firstApt.patient_phone || 'N/A',
          age: firstApt.patient_age || 'N/A',
          gender: firstApt.patient_gender || 'N/A'
        }

        // Try to parse mobile_booking_data if available
        if (firstApt.mobile_booking_data) {
          try {
            const bookingData = typeof firstApt.mobile_booking_data === 'string' 
              ? JSON.parse(firstApt.mobile_booking_data) 
              : firstApt.mobile_booking_data
            
            patientInfo = {
              ...patientInfo,
              patient_name: bookingData.patient_name || patientInfo.patient_name,
              email: bookingData.patient_email || patientInfo.email,
              phone: bookingData.patient_phone || patientInfo.phone,
              age: bookingData.patient_age || patientInfo.age,
              gender: bookingData.patient_gender || patientInfo.gender
            }
          } catch (e) {
            console.error('Error parsing mobile_booking_data:', e)
          }
        }

        setPatient(patientInfo)
      }

      setAppointments(appointmentData || [])

      // Fetch bills
      const { data: billData, error: billError } = await supabase
        .from('opbilling')
        .select('*')
        .eq('patient_mrno', patientId)
        .order('created_at', { ascending: false })
      
      if (billError) throw billError
      setBills(billData || [])

    } catch (err) {
      console.error('Error fetching patient data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleViewBill = (bill) => {
    setSelectedBill(bill)
    setShowBillDetailsModal(true)
  }

  const getTotalBilled = () => {
    return bills.reduce((sum, bill) => sum + (bill.total_amount || 0), 0)
  }

  const getTotalPaid = () => {
    return bills.reduce((sum, bill) => sum + (bill.paid_amount || 0), 0)
  }

  const getTotalDue = () => {
    return bills.reduce((sum, bill) => sum + (bill.balance_due || 0), 0)
  }

  const formatPhone = (phone) => {
    if (!phone || phone === 'N/A') return 'N/A'
    // Convert to string and remove any non-digit characters
    const phoneStr = String(phone).replace(/\D/g, '')
    // Format as phone number if it's a valid length
    if (phoneStr.length === 10) {
      return `${phoneStr.slice(0, 5)}-${phoneStr.slice(5)}`
    }
    return phoneStr
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cura-primary"></div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-lg text-gray-600 font-medium">Patient not found</p>
        <button
          onClick={onBack}
          className="mt-4 px-6 py-2 bg-cura-primary text-white rounded-xl hover:bg-cura-secondary transition-colors"
        >
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Patients</span>
        </button>
        <button
          onClick={() => setShowAddBillModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cura-primary to-cura-secondary text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold"
        >
          <Plus className="w-5 h-5" />
          Add Bill
        </button>
      </div>

      {/* Patient Header Card */}
      <div className="bg-gradient-to-r from-cura-primary to-cura-secondary rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <User className="w-12 h-12 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">{patient.patient_name}</h1>
              <div className="flex items-center gap-4 text-blue-100">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  MR No: {patient.patient_id}
                </span>
                {patient.age !== 'N/A' && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {patient.age} years
                  </span>
                )}
                {patient.gender !== 'N/A' && (
                  <span className="flex items-center gap-1">
                    <Activity className="w-4 h-4" />
                    {patient.gender}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {patient.phone !== 'N/A' && (
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <Phone className="w-5 h-5" />
              <span>{formatPhone(patient.phone)}</span>
            </div>
          )}
          {patient.email !== 'N/A' && (
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <Mail className="w-5 h-5" />
              <span>{patient.email}</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-sm text-gray-600 font-semibold">Total Visits</p>
          <p className="text-3xl font-bold text-gray-900">{appointments.length}</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-sm text-gray-600 font-semibold">Total Billed</p>
          <p className="text-3xl font-bold text-gray-900">₹{getTotalBilled()}</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-sm text-gray-600 font-semibold">Total Paid</p>
          <p className="text-3xl font-bold text-green-600">₹{getTotalPaid()}</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-sm text-gray-600 font-semibold">Balance Due</p>
          <p className="text-3xl font-bold text-red-600">₹{getTotalDue()}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="border-b border-gray-200">
          <div className="flex gap-2 p-2">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'appointments', label: 'Appointments', icon: Calendar },
              { id: 'billing', label: 'Billing History', icon: DollarSign }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-cura-primary to-cura-secondary text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recent Appointments */}
                <div className="bg-blue-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-cura-primary" />
                    Recent Appointments
                  </h3>
                  {appointments.slice(0, 3).length > 0 ? (
                    <div className="space-y-3">
                      {appointments.slice(0, 3).map((apt, index) => (
                        <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                          <p className="font-semibold text-gray-900">{apt.date}</p>
                          <p className="text-sm text-gray-600">{apt.time} - {apt.reason_for_visit || 'Consultation'}</p>
                          <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${
                            apt.status?.toLowerCase() === 'completed' ? 'bg-green-100 text-green-700' :
                            apt.status?.toLowerCase() === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {apt.status?.toUpperCase() || 'SCHEDULED'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No appointments found</p>
                  )}
                </div>

                {/* Recent Bills */}
                <div className="bg-green-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-cura-primary" />
                    Recent Bills
                  </h3>
                  {bills.slice(0, 3).length > 0 ? (
                    <div className="space-y-3">
                      {bills.slice(0, 3).map((bill, index) => (
                        <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-gray-900">{bill.bill_number}</p>
                              <p className="text-sm text-gray-600">{bill.service_name}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              bill.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {bill.payment_status?.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-lg font-bold text-gray-900 mt-2">₹{bill.total_amount}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No bills found</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Appointments Tab */}
          {activeTab === 'appointments' && (
            <div className="space-y-4">
              {appointments.length > 0 ? (
                appointments.map((apt, index) => (
                  <div key={index} className="bg-white rounded-xl border-2 border-gray-200 p-5 hover:border-cura-primary hover:shadow-lg transition-all">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <span className="text-lg font-bold text-gray-900">{apt.date}</span>
                          <span className="text-gray-600">{apt.time}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            apt.status?.toLowerCase() === 'completed' ? 'bg-green-100 text-green-700' :
                            apt.status?.toLowerCase() === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {apt.status?.toUpperCase() || 'SCHEDULED'}
                          </span>
                        </div>
                        <p className="text-gray-700">{apt.reason_for_visit || apt.appointment_type || 'General Consultation'}</p>
                        {apt.doctor_name && (
                          <p className="text-sm text-gray-600 mt-2 flex items-center gap-1">
                            <Stethoscope className="w-4 h-4" />
                            Dr. {apt.doctor_name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No appointments found</p>
                </div>
              )}
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <div className="space-y-4">
              {bills.length > 0 ? (
                bills.map((bill, index) => (
                  <div key={index} className="bg-white rounded-xl border-2 border-gray-200 p-5 hover:border-cura-primary hover:shadow-lg transition-all">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <span className="text-lg font-bold text-gray-900">{bill.bill_number}</span>
                          <span className="text-gray-600">{bill.bill_date}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            bill.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                            bill.payment_status === 'partially_paid' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {bill.payment_status?.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-gray-700 font-medium">{bill.service_name}</p>
                        <p className="text-sm text-gray-600 mt-1">{bill.service_category}</p>
                        <div className="flex items-center gap-6 mt-3">
                          <div>
                            <p className="text-sm text-gray-600">Total</p>
                            <p className="text-lg font-bold text-gray-900">₹{bill.total_amount}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Paid</p>
                            <p className="text-lg font-bold text-green-600">₹{bill.paid_amount}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Due</p>
                            <p className="text-lg font-bold text-red-600">₹{bill.balance_due}</p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleViewBill(bill)}
                        className="px-4 py-2 text-cura-primary hover:bg-blue-50 rounded-lg transition-colors font-semibold"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No bills found</p>
                  <button
                    onClick={() => setShowAddBillModal(true)}
                    className="mt-4 px-6 py-2 bg-gradient-to-r from-cura-primary to-cura-secondary text-white rounded-xl hover:shadow-lg transition-all"
                  >
                    Create First Bill
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Bill Modal */}
      {showAddBillModal && (
        <AddBillModal
          onClose={() => setShowAddBillModal(false)}
          onBillCreated={() => {
            fetchPatientData()
            setShowAddBillModal(false)
          }}
          prefilledPatientId={patientId}
        />
      )}

      {/* Bill Details Modal */}
      {showBillDetailsModal && selectedBill && (
        <BillDetailsModal
          bill={selectedBill}
          onClose={() => {
            setShowBillDetailsModal(false)
            setSelectedBill(null)
          }}
          onUpdate={fetchPatientData}
        />
      )}
    </div>
  )
}

export default PatientProfile
