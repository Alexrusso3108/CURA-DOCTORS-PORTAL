import React, { useState, useEffect } from 'react'
import { X, Download, FileText, Calendar, User, Clock } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'

const FormViewer = ({ doctorId, onClose }) => {
  const [forms, setForms] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedForm, setSelectedForm] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchForms()
  }, [doctorId, filter])

  const fetchForms = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('medical_forms')
        .select('*')
        .eq('doctor_id', String(doctorId))
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('form_type', filter)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching forms:', error)
        return
      }

      console.log('Fetched forms:', data)
      
      // Fetch patient names from appointments
      if (data && data.length > 0) {
        const appointmentIds = data.map(f => f.appointment_id).filter(Boolean)
        
        if (appointmentIds.length > 0) {
          const { data: appointments, error: aptError } = await supabase
            .from('appointments')
            .select('appointment_id, patient_name')
            .in('appointment_id', appointmentIds)
          
          if (!aptError && appointments) {
            // Map patient names to forms
            const formsWithNames = data.map(form => {
              const appointment = appointments.find(apt => apt.appointment_id === form.appointment_id)
              return {
                ...form,
                patient_name: appointment?.patient_name || 'Unknown Patient'
              }
            })
            setForms(formsWithNames)
            return
          }
        }
      }
      
      setForms(data || [])
      
    } catch (err) {
      console.error('Error in fetchForms:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = (form) => {
    const link = document.createElement('a')
    link.href = form.form_data
    link.download = `${form.form_type}_${form.patient_id}_${new Date(form.created_at).toLocaleDateString()}.png`
    link.click()
  }

  const getFormTypeLabel = (type) => {
    const labels = {
      prescription: 'Prescription',
      consultation: 'Consultation Notes',
      laboratory: 'Laboratory Request',
      certificate: 'Medical Certificate'
    }
    return labels[type] || type
  }

  const getFormTypeColor = (type) => {
    const colors = {
      prescription: 'bg-blue-100 text-blue-700',
      consultation: 'bg-green-100 text-green-700',
      laboratory: 'bg-orange-100 text-orange-700',
      certificate: 'bg-purple-100 text-purple-700'
    }
    return colors[type] || 'bg-gray-100 text-gray-700'
  }

  if (selectedForm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[95vh] flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {getFormTypeLabel(selectedForm.form_type)}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {selectedForm.patient_name && <span className="font-medium">{selectedForm.patient_name} | </span>}
                Patient ID: {selectedForm.patient_id} | {new Date(selectedForm.created_at).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownload(selectedForm)}
                className="flex items-center gap-2 px-4 py-2 bg-cura-primary text-white rounded-lg hover:bg-cura-secondary transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={() => setSelectedForm(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto p-6 bg-gray-100">
            <img 
              src={selectedForm.form_data} 
              alt="Medical Form" 
              className="max-w-full mx-auto shadow-lg"
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Medical Forms & Reports</h2>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cura-primary focus:border-transparent outline-none"
          >
            <option value="all">All Forms</option>
            <option value="prescription">Prescriptions</option>
            <option value="consultation">Consultation Notes</option>
            <option value="laboratory">Lab Requests</option>
            <option value="certificate">Certificates</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cura-primary"></div>
        </div>
      ) : forms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {forms.map((form) => (
            <div
              key={form.id}
              className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedForm(form)}
            >
              <div className="aspect-[3/4] bg-white relative overflow-hidden">
                <img 
                  src={form.form_data} 
                  alt="Form preview" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
              
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getFormTypeColor(form.form_type)}`}>
                    {getFormTypeLabel(form.form_type)}
                  </span>
                </div>
                
                <div className="space-y-1 text-sm text-gray-600">
                  {form.patient_name && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span className="font-medium text-gray-900">{form.patient_name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>Patient ID: {form.patient_id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(form.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(form.created_at).toLocaleTimeString()}</span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDownload(form)
                  }}
                  className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-lg text-gray-600 font-medium">No forms found</p>
          <p className="text-sm text-gray-500 mt-2">
            {filter === 'all' 
              ? 'Forms will appear here once you create them' 
              : `No ${getFormTypeLabel(filter).toLowerCase()} found`}
          </p>
        </div>
      )}
    </div>
  )
}

export default FormViewer
