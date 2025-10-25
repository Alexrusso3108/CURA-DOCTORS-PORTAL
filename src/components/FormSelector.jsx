import React from 'react'
import { X, FileText, ClipboardList, TestTube, Award } from 'lucide-react'

const FormSelector = ({ appointmentData, onSelectForm, onClose }) => {
  const forms = [
    {
      id: 'prescription',
      title: 'Prescription Form',
      description: 'Write prescriptions and medication details',
      icon: FileText,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'consultation',
      title: 'Consultation Notes',
      description: 'Record patient consultation details',
      icon: ClipboardList,
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'laboratory',
      title: 'Laboratory Request',
      description: 'Request laboratory tests and investigations',
      icon: TestTube,
      color: 'from-orange-500 to-orange-600'
    },
    {
      id: 'certificate',
      title: 'Medical Certificate',
      description: 'Issue medical certificates and fitness reports',
      icon: Award,
      color: 'from-purple-500 to-purple-600'
    }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create New Form</h2>
            <p className="text-sm text-gray-600 mt-1">
              Patient: {appointmentData?.patient_name || 'N/A'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {forms.map((form) => {
            const Icon = form.icon
            return (
              <button
                key={form.id}
                onClick={() => onSelectForm(form.id)}
                className="group relative bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-cura-primary hover:shadow-lg transition-all text-left"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-4 rounded-xl bg-gradient-to-br ${form.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-cura-primary transition-colors">
                      {form.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{form.description}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>💡 Tip:</strong> Use your S-Pen or stylus to write directly on the forms. 
            All forms will be saved and can be viewed later.
          </p>
        </div>
      </div>
    </div>
  )
}

export default FormSelector
