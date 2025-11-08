import React, { useState, useEffect } from 'react'
import { 
  Users, Search, Calendar, DollarSign, Eye, 
  Phone, Mail, Activity, AlertCircle
} from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import PatientProfile from './PatientProfile'

const PatientsList = () => {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPatient, setSelectedPatient] = useState(null)

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      setLoading(true)
      
      console.log('Fetching patients from appointments...')
      
      // Fetch all appointments to get unique patients
      const { data: appointmentData, error: aptError } = await supabase
        .from('appointments')
        .select('*')
        .order('date', { ascending: false })
      
      if (aptError) {
        console.error('Error fetching appointments:', aptError)
      }

      console.log('Appointments data:', appointmentData?.length || 0, 'records')

      // Also fetch from opbilling to get patients who have bills
      const { data: billingData, error: billError } = await supabase
        .from('opbilling')
        .select('patient_mrno')
        .order('created_at', { ascending: false })
      
      if (billError) {
        console.error('Error fetching billing data:', billError)
      }

      console.log('Billing data:', billingData?.length || 0, 'records')

      // Group by patient_id to get unique patients
      const patientsMap = new Map()
      
      // Process appointments data
      appointmentData?.forEach(apt => {
        const patientId = apt.mrno || apt.patient_id
        if (patientId && !patientsMap.has(patientId)) {
          let patientInfo = {
            patient_id: patientId,
            patient_name: apt.patient_name || 'Unknown Patient',
            email: 'N/A',
            phone: apt.patient_phone || 'N/A',
            age: 'N/A',
            gender: 'N/A',
            last_visit: apt.date,
            appointment_count: 1
          }

          // Try to parse mobile_booking_data if available
          if (apt.mobile_booking_data) {
            try {
              const bookingData = typeof apt.mobile_booking_data === 'string' 
                ? JSON.parse(apt.mobile_booking_data) 
                : apt.mobile_booking_data
              
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

          patientsMap.set(patientId, patientInfo)
        } else if (patientId && patientsMap.has(patientId)) {
          // Increment appointment count
          const existing = patientsMap.get(patientId)
          existing.appointment_count++
          // Update last visit if more recent
          if (apt.date > existing.last_visit) {
            existing.last_visit = apt.date
          }
        }
      })

      // Add patients from billing data who might not have appointments
      billingData?.forEach(bill => {
        if (bill.patient_mrno && !patientsMap.has(bill.patient_mrno)) {
          patientsMap.set(bill.patient_mrno, {
            patient_id: bill.patient_mrno,
            patient_name: 'Patient ' + bill.patient_mrno.substring(0, 8),
            email: 'N/A',
            phone: 'N/A',
            age: 'N/A',
            gender: 'N/A',
            last_visit: 'N/A',
            appointment_count: 0
          })
        }
      })

      const uniquePatients = Array.from(patientsMap.values())
      console.log('Total unique patients:', uniquePatients.length)
      setPatients(uniquePatients)

    } catch (err) {
      console.error('Error fetching patients:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleViewProfile = (patientId) => {
    setSelectedPatient(patientId)
  }

  const handleBackToList = () => {
    setSelectedPatient(null)
    fetchPatients() // Refresh list
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

  const filteredPatients = patients.filter(patient => {
    if (!searchQuery.trim()) return true
    
    const query = searchQuery.toLowerCase()
    return (
      patient.patient_name?.toLowerCase().includes(query) ||
      patient.patient_id?.toLowerCase().includes(query) ||
      patient.phone?.toLowerCase().includes(query) ||
      patient.email?.toLowerCase().includes(query)
    )
  })

  // If a patient is selected, show their profile
  if (selectedPatient) {
    return <PatientProfile patientId={selectedPatient} onBack={handleBackToList} />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-cura-primary to-cura-secondary bg-clip-text text-transparent">
            Patients Directory
          </h2>
          <p className="text-gray-600 mt-1">Manage and view patient information</p>
        </div>
        <div className="bg-gradient-to-r from-cura-primary to-cura-secondary text-white px-6 py-3 rounded-xl shadow-lg">
          <p className="text-sm font-medium">Total Patients</p>
          <p className="text-3xl font-bold">{patients.length}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, MR number, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cura-primary focus:border-cura-primary outline-none transition-all duration-300 shadow-sm hover:shadow-md"
          />
        </div>
      </div>

      {/* Patients Grid */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cura-primary"></div>
          </div>
        ) : filteredPatients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPatients.map((patient, index) => (
              <div
                key={index}
                className="group bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-200 p-6 hover:border-cura-primary hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => handleViewProfile(patient.patient_id)}
              >
                {/* Patient Avatar */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-cura-primary to-cura-secondary rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      {patient.patient_name?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg group-hover:text-cura-primary transition-colors">
                        {patient.patient_name}
                      </h3>
                      <p className="text-sm text-gray-600">MR: {patient.patient_id?.substring(0, 8)}...</p>
                    </div>
                  </div>
                </div>

                {/* Patient Info */}
                <div className="space-y-2 mb-4">
                  {patient.phone !== 'N/A' && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-cura-primary" />
                      <span>{formatPhone(patient.phone)}</span>
                    </div>
                  )}
                  {patient.email !== 'N/A' && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4 text-cura-primary" />
                      <span className="truncate">{patient.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {patient.age !== 'N/A' && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-cura-primary" />
                        {patient.age} yrs
                      </span>
                    )}
                    {patient.gender !== 'N/A' && (
                      <span className="flex items-center gap-1">
                        <Activity className="w-4 h-4 text-cura-primary" />
                        {patient.gender}
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-600">Total Visits</p>
                    <p className="text-lg font-bold text-gray-900">{patient.appointment_count}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Last Visit</p>
                    <p className="text-sm font-semibold text-gray-900">{patient.last_visit}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleViewProfile(patient.patient_id)
                    }}
                    className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-cura-primary to-cura-secondary text-white rounded-lg hover:shadow-lg transition-all text-sm font-semibold"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-lg text-gray-600 font-medium">
              {searchQuery ? 'No patients found matching your search' : 'No patients found'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {searchQuery ? 'Try adjusting your search terms' : 'Patients will appear here once they have appointments'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default PatientsList
