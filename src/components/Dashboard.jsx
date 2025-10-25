import React, { useState, useEffect } from 'react'
import { 
  Users, Calendar, Activity, FileText, LogOut, Menu, X,
  Bell, Search, Clock, TrendingUp, UserCheck, Stethoscope,
  ClipboardList, Settings, Home, FilePlus
} from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import FormSelector from './FormSelector'
import MedicalFormCanvas from './MedicalFormCanvas'
import FormViewer from './FormViewer'

const Dashboard = () => {
  const [doctorData, setDoctorData] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState({
    todayAppointments: 0,
    completedToday: 0
  })
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFormSelector, setShowFormSelector] = useState(false)
  const [showFormCanvas, setShowFormCanvas] = useState(false)
  const [selectedFormType, setSelectedFormType] = useState(null)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingForm, setEditingForm] = useState(null)

  useEffect(() => {
    const storedData = sessionStorage.getItem('doctorData')
    if (storedData) {
      const doctor = JSON.parse(storedData)
      setDoctorData(doctor)
      fetchAppointments(doctor.doctor_id)
    }
    fetchStats()
  }, [])

  const fetchAppointments = async (doctorId) => {
    try {
      setLoading(true)
      
      // First, try to fetch all appointments to see the structure
      console.log('Fetching appointments for doctor_id:', doctorId)
      
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', doctorId)

      if (error) {
        console.error('Error fetching appointments:', error)
        console.error('Error details:', error.message, error.details, error.hint)
        
        // Try without the doctor_id filter to see if table exists
        const { data: testData, error: testError } = await supabase
          .from('appointments')
          .select('*')
          .limit(1)
        
        if (testError) {
          console.error('Table might not exist or no access:', testError)
        } else {
          console.log('Sample appointment structure:', testData)
        }
        
        setLoading(false)
        return
      }

      console.log('✅ Fetched appointments:', data)
      console.log('Number of appointments:', data?.length || 0)
      
      if (data && data.length > 0) {
        console.log('Sample appointment columns:', Object.keys(data[0]))
        console.log('Sample appointment data:', data[0])
        
        // Extract patient names from mobile_booking_data JSON field for web app bookings
        data.forEach((apt, idx) => {
          // If patient_name is null but mobile_booking_data exists, extract it from JSON
          if ((!apt.patient_name || apt.patient_name === null) && apt.mobile_booking_data) {
            try {
              const bookingData = typeof apt.mobile_booking_data === 'string' 
                ? JSON.parse(apt.mobile_booking_data) 
                : apt.mobile_booking_data
              
              if (bookingData && bookingData.patient_name) {
                apt.patient_name = bookingData.patient_name
                console.log(`Extracted patient name from mobile_booking_data: ${apt.patient_name}`)
              }
            } catch (e) {
              console.error('Error parsing mobile_booking_data:', e)
            }
          }
        })
      }
      
      setAppointments(data || [])
      
      // Calculate stats from appointments
      const today = new Date().toISOString().split('T')[0]
      console.log('Today\'s date:', today)
      
      const todayAppts = data?.filter(apt => {
        console.log(`Appointment date: ${apt.date}, matches today: ${apt.date === today}`)
        return apt.date === today
      }) || []
      
      console.log('Today\'s appointments count:', todayAppts.length)
      
      const completed = todayAppts.filter(apt => 
        apt.status?.toLowerCase() === 'completed'
      )
      
      console.log('Completed today count:', completed.length)
      
      setStats(prev => ({
        ...prev,
        todayAppointments: todayAppts.length,
        completedToday: completed.length
      }))
      
    } catch (err) {
      console.error('Error in fetchAppointments:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    // Stats are now fetched from database in fetchAppointments
  }

  const handleLogout = () => {
    sessionStorage.removeItem('doctorData')
    window.location.href = '/'
  }

  const handleCreateForm = (appointment) => {
    setSelectedAppointment({
      ...appointment,
      doctor_name: doctorData?.name,
      registration_no: doctorData?.registration_no || ''
    })
    setShowFormSelector(true)
  }

  const handleSelectForm = (formType) => {
    setSelectedFormType(formType)
    setShowFormSelector(false)
    setShowFormCanvas(true)
  }

  const handleFormSaved = () => {
    setShowFormCanvas(false)
    setSelectedFormType(null)
    setSelectedAppointment(null)
    setEditingForm(null)
  }

  const handleEditForm = (form) => {
    // Set up the form for editing
    setEditingForm(form)
    setSelectedFormType(form.form_type)
    setSelectedAppointment({
      appointment_id: form.appointment_id,
      patient_id: form.patient_id,
      patient_name: form.patient_name,
      doctor_name: doctorData?.name,
      registration_no: doctorData?.registration_no || ''
    })
    setShowFormCanvas(true)
  }

  const StatCard = ({ icon: Icon, title, value, change, color }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              {change}
            </p>
          )}
        </div>
        <div className={`p-4 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  )

  const AppointmentCard = ({ patient, time, type, status, appointmentData, showActions = false }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex items-center gap-4 flex-1">
        <div className="w-12 h-12 bg-gradient-to-br from-cura-primary to-cura-secondary rounded-full flex items-center justify-center text-white font-semibold">
          {patient.charAt(0)}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-900">{patient}</p>
          <p className="text-sm text-gray-600 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {time}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {showActions && (
          <button
            onClick={() => handleCreateForm(appointmentData)}
            className="flex items-center gap-2 px-3 py-2 bg-cura-primary text-white rounded-lg hover:bg-cura-secondary transition-colors text-sm"
          >
            <FilePlus className="w-4 h-4" />
            Create Form
          </button>
        )}
        <div className="text-right">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            status === 'completed' ? 'bg-green-100 text-green-700' :
            status === 'ongoing' ? 'bg-blue-100 text-blue-700' :
            'bg-yellow-100 text-yellow-700'
          }`}>
            {status}
          </span>
          <p className="text-sm text-gray-600 mt-1">{type}</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div>
                <h2 className="text-xl font-bold text-cura-primary">Cura Hospitals</h2>
                <p className="text-xs text-gray-600">Doctor Portal</p>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'overview', icon: Home, label: 'Overview' },
            { id: 'appointments', icon: Calendar, label: 'Appointments' },
            { id: 'reports', icon: FileText, label: 'Reports' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-cura-primary to-cura-secondary text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-cura-primary to-cura-secondary rounded-full flex items-center justify-center text-white font-semibold">
              {doctorData?.name?.charAt(0) || 'D'}
            </div>
            {sidebarOpen && (
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">{doctorData?.name || 'Doctor'}</p>
                <p className="text-xs text-gray-600">{doctorData?.department || 'Department'}</p>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button
              onClick={handleLogout}
              className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, Dr. {doctorData?.name?.split(' ').pop() || 'Doctor'}!
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </header>

        <div className="p-8">
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <StatCard
                  icon={Calendar}
                  title="Today's Appointments"
                  value={stats.todayAppointments}
                  color="bg-gradient-to-br from-green-500 to-green-600"
                />
                <StatCard
                  icon={UserCheck}
                  title="Completed Today"
                  value={stats.completedToday}
                  color="bg-gradient-to-br from-purple-500 to-purple-600"
                />
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                      {activeTab === 'overview' ? "Today's Appointments" : 'All Appointments'}
                    </h2>
                    {activeTab === 'overview' && (
                      <button 
                        onClick={() => setActiveTab('appointments')}
                        className="text-cura-primary hover:text-cura-secondary font-medium text-sm"
                      >
                        View All
                      </button>
                    )}
                  </div>
                  <div className="mb-6">
                    <div className="relative">
                      <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search by patient name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cura-primary focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cura-primary"></div>
                    </div>
                  ) : appointments.length > 0 ? (
                    <div className="space-y-3">
                      {appointments
                        .filter(apt => {
                          // Filter by date for overview tab
                          if (activeTab === 'overview') {
                            const today = new Date().toISOString().split('T')[0]
                            if (apt.date !== today) return false
                          }
                          
                          // Filter by search query
                          if (searchQuery.trim()) {
                            const patientName = apt.patient_name || ''
                            return patientName.toLowerCase().includes(searchQuery.toLowerCase())
                          }
                          
                          return true
                        })
                        .map((apt, index) => (
                          <AppointmentCard
                            key={apt.appointment_id || index}
                            patient={apt.patient_name || `Patient ${apt.patient_id}`}
                            time={apt.time || 'N/A'}
                            type={apt.appointment_type || apt.reason_for_visit || 'consultation'}
                            status={apt.status?.toLowerCase() || 'scheduled'}
                            appointmentData={apt}
                            showActions={true}
                          />
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600">No appointments found</p>
                      <p className="text-sm text-gray-500 mt-1">Appointments will appear here once scheduled</p>
                    </div>
                  )}
              </div>
            </>
          )}

          {activeTab === 'appointments' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">All Appointments</h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Total: {appointments.filter(apt => {
                    if (searchQuery.trim()) {
                      const patientName = apt.patient_name || ''
                      return patientName.toLowerCase().includes(searchQuery.toLowerCase())
                    }
                    return true
                  }).length}</span>
                </div>
              </div>
              <div className="mb-6">
                <div className="relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by patient name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cura-primary focus:border-transparent outline-none"
                  />
                </div>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cura-primary"></div>
                </div>
              ) : appointments.length > 0 ? (
                <div className="space-y-3">
                  {appointments
                    .filter(apt => {
                      // Filter by search query
                      if (searchQuery.trim()) {
                        const patientName = apt.patient_name || ''
                        return patientName.toLowerCase().includes(searchQuery.toLowerCase())
                      }
                      return true
                    })
                    .map((apt, index) => (
                    <div key={apt.appointment_id || index} className="flex items-center justify-between p-5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-14 h-14 bg-gradient-to-br from-cura-primary to-cura-secondary rounded-full flex items-center justify-center text-white font-semibold text-lg">
                          {apt.patient_name?.charAt(0) || 'P'}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-lg">{apt.patient_name || `Patient ${apt.patient_id}`}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {apt.date || 'N/A'}
                            </p>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {apt.time || 'N/A'}
                            </p>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{apt.appointment_type || apt.reason_for_visit || 'consultation'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleCreateForm(apt)}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cura-primary to-cura-secondary text-white rounded-lg hover:shadow-lg transition-all"
                        >
                          <FilePlus className="w-4 h-4" />
                          Create Form
                        </button>
                        <div className="text-right">
                          <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                            apt.status?.toLowerCase() === 'completed' ? 'bg-green-100 text-green-700' :
                            apt.status?.toLowerCase() === 'ongoing' ? 'bg-blue-100 text-blue-700' :
                            apt.status?.toLowerCase() === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {apt.status || 'Scheduled'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-lg text-gray-600 font-medium">No appointments found</p>
                  <p className="text-sm text-gray-500 mt-2">Appointments will appear here once scheduled</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reports' && (
            <FormViewer 
              doctorId={doctorData?.doctor_id} 
              onEditForm={handleEditForm}
            />
          )}

          {activeTab !== 'overview' && activeTab !== 'appointments' && activeTab !== 'reports' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
              <p className="text-gray-600">This section is under development...</p>
            </div>
          )}
        </div>
      </main>

      {/* Form Selector Modal */}
      {showFormSelector && (
        <FormSelector
          appointmentData={selectedAppointment}
          onSelectForm={handleSelectForm}
          onClose={() => setShowFormSelector(false)}
        />
      )}

      {/* Form Canvas Modal */}
      {showFormCanvas && (
        <MedicalFormCanvas
          formType={selectedFormType}
          appointmentData={selectedAppointment}
          existingFormData={editingForm}
          onClose={() => setShowFormCanvas(false)}
          onSave={handleFormSaved}
        />
      )}
    </div>
  )
}

export default Dashboard
