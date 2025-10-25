import React, { useRef, useState, useEffect } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import html2canvas from 'html2canvas'
import { X, Save, RotateCcw, Pen, Eraser } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'

const MedicalFormCanvas = ({ formType, appointmentData, onClose, onSave }) => {
  const canvasRef = useRef(null)
  const formContainerRef = useRef(null)
  const [penColor, setPenColor] = useState('#000000')
  const [penWidth, setPenWidth] = useState(2)
  const [isEraser, setIsEraser] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [medicines, setMedicines] = useState([])
  const [selectedMedicines, setSelectedMedicines] = useState([])
  const [showMedicineDropdown, setShowMedicineDropdown] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [labTests, setLabTests] = useState([])
  const [radiologyTests, setRadiologyTests] = useState([])
  const [selectedTests, setSelectedTests] = useState([])
  const [showTestDropdown, setShowTestDropdown] = useState(false)
  const [testSearchTerm, setTestSearchTerm] = useState('')

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.getCanvas().style.touchAction = 'none'
    }
    if (formType === 'prescription') {
      fetchMedicines()
    }
    if (formType === 'laboratory') {
      fetchLabTests()
      fetchRadiologyTests()
    }
  }, [])

  // Update template when medicines change
  useEffect(() => {
    if (formType === 'prescription') {
      const templateDiv = document.querySelector('[style*="pointer-events: none"]')
      if (templateDiv) {
        templateDiv.innerHTML = getFormTemplate()
      }
    }
  }, [selectedMedicines])

  // Update template when tests change
  useEffect(() => {
    if (formType === 'laboratory') {
      const templateDiv = document.querySelector('[style*="pointer-events: none"]')
      if (templateDiv) {
        templateDiv.innerHTML = getFormTemplate()
      }
    }
  }, [selectedTests])

  const fetchMedicines = async () => {
    try {
      const { data, error } = await supabase
        .from('medicines')
        .select('*')
        .order('name', { ascending: true })

      if (error) {
        console.error('Error fetching medicines:', error)
        return
      }

      console.log('Fetched medicines:', data)
      setMedicines(data || [])
    } catch (err) {
      console.error('Error in fetchMedicines:', err)
    }
  }

  const addMedicine = (medicine) => {
    if (!selectedMedicines.find(m => m.id === medicine.id)) {
      const newMedicines = [...selectedMedicines, { ...medicine, dosage: '', duration: '', instructions: '' }]
      setSelectedMedicines(newMedicines)
      // Force re-render of template
      setTimeout(() => {
        const templateDiv = document.querySelector('[style*="pointer-events: none"]')
        if (templateDiv) {
          templateDiv.innerHTML = getFormTemplate()
        }
      }, 10)
    }
    setShowMedicineDropdown(false)
    setSearchTerm('')
  }

  const removeMedicine = (medicineId) => {
    const newMedicines = selectedMedicines.filter(m => m.id !== medicineId)
    setSelectedMedicines(newMedicines)
    // Force re-render of template
    setTimeout(() => {
      const templateDiv = document.querySelector('[style*="pointer-events: none"]')
      if (templateDiv) {
        templateDiv.innerHTML = getFormTemplate()
      }
    }, 10)
  }

  const updateMedicineDetails = (medicineId, field, value) => {
    const newMedicines = selectedMedicines.map(m => 
      m.id === medicineId ? { ...m, [field]: value } : m
    )
    setSelectedMedicines(newMedicines)
    // Force re-render of template
    setTimeout(() => {
      const templateDiv = document.querySelector('[style*="pointer-events: none"]')
      if (templateDiv) {
        templateDiv.innerHTML = getFormTemplate()
      }
    }, 10)
  }

  const fetchLabTests = async () => {
    try {
      const { data, error } = await supabase
        .from('lab_tests')
        .select('*')
        .order('name', { ascending: true })

      if (error) {
        console.error('Error fetching lab tests:', error)
        return
      }

      console.log('Fetched lab tests:', data)
      setLabTests(data || [])
    } catch (err) {
      console.error('Error in fetchLabTests:', err)
    }
  }

  const fetchRadiologyTests = async () => {
    try {
      const { data, error } = await supabase
        .from('radiology_services')
        .select('*')
        .order('name', { ascending: true })

      if (error) {
        console.error('Error fetching radiology tests:', error)
        return
      }

      console.log('Fetched radiology tests:', data)
      setRadiologyTests(data || [])
    } catch (err) {
      console.error('Error in fetchRadiologyTests:', err)
    }
  }

  const addTest = (test) => {
    if (!selectedTests.find(t => t.id === test.id && t.type === test.type)) {
      const newTests = [...selectedTests, { ...test }]
      setSelectedTests(newTests)
      // Force re-render of template
      setTimeout(() => {
        const templateDiv = document.querySelector('[style*="pointer-events: none"]')
        if (templateDiv) {
          templateDiv.innerHTML = getFormTemplate()
        }
      }, 10)
    }
    setShowTestDropdown(false)
    setTestSearchTerm('')
  }

  const removeTest = (testId, testType) => {
    const newTests = selectedTests.filter(t => !(t.id === testId && t.type === testType))
    setSelectedTests(newTests)
    // Force re-render of template
    setTimeout(() => {
      const templateDiv = document.querySelector('[style*="pointer-events: none"]')
      if (templateDiv) {
        templateDiv.innerHTML = getFormTemplate()
      }
    }, 10)
  }

  const filteredMedicines = medicines.filter(m => 
    m.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const allTests = [
    ...labTests.map(t => ({ ...t, type: 'lab', name: t.name })),
    ...radiologyTests.map(t => ({ ...t, type: 'radiology', name: t.name }))
  ]

  const filteredTests = allTests.filter(t => 
    t.name?.toLowerCase().includes(testSearchTerm.toLowerCase())
  )

  const getFormTemplate = () => {
    const patientName = appointmentData?.patient_name || 'Patient Name'
    const patientId = appointmentData?.patient_id || 'N/A'
    const mrNo = appointmentData?.mr_no || `fa04f319-80db-49df-ae8b-07ede794e61d`
    const age = appointmentData?.age || '21'
    const gender = appointmentData?.gender || 'Male'
    const phone = appointmentData?.phone || '9717963909'
    const date = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    const doctorName = appointmentData?.doctor_name || 'Dr. Rajesh Kumar'
    const regNo = appointmentData?.registration_no || ''

    // Generate medicines list HTML
    const medicinesHTML = selectedMedicines.map((med, index) => `
      <div style="margin-bottom: 20px; padding: 10px; background: #f9f9f9; border-left: 3px solid #0066CC;">
        <div style="font-weight: bold; font-size: 14px; margin-bottom: 5px;">${index + 1}. ${med.name}</div>
        ${med.dosage ? `<div style="margin-left: 20px; font-size: 12px;"><strong>Dosage:</strong> ${med.dosage}</div>` : ''}
        ${med.duration ? `<div style="margin-left: 20px; font-size: 12px;"><strong>Duration:</strong> ${med.duration}</div>` : ''}
        ${med.instructions ? `<div style="margin-left: 20px; font-size: 12px;"><strong>Instructions:</strong> ${med.instructions}</div>` : ''}
      </div>
    `).join('')

    switch (formType) {
      case 'prescription':
        return `
          <div style="font-family: Arial, sans-serif; padding: 40px; background: white;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="/ch logo.png" alt="CURA HOSPITALS" style="height: 80px; margin: 0 auto 10px auto; display: block;" />
              <p style="margin: 5px 0;">Bengaluru, Karnataka</p>
              <h2 style="color: #0066CC; margin: 10px 0;">PRESCRIPTION</h2>
            </div>
            
            <div style="border: 2px solid #000; padding: 20px; margin-bottom: 20px;">
              <h3 style="margin: 0 0 15px 0;">PATIENT INFORMATION</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
                <div><strong>Name:</strong> ${patientName}</div>
                <div><strong>Age:</strong> ${age} years</div>
                <div><strong>Gender:</strong> ${gender}</div>
                <div style="grid-column: 1 / 3;"><strong>MR No:</strong> ${mrNo}</div>
                <div><strong>Date:</strong> ${date}</div>
                <div style="grid-column: 1 / 4;"><strong>Phone:</strong> ${phone}</div>
              </div>
            </div>

            <div style="border: 2px solid #000; padding: 20px; min-height: 600px; margin-bottom: 20px;">
              <h3 style="margin: 0 0 20px 0;">PRESCRIPTION</h3>
              ${medicinesHTML || '<div style="color: #999; font-style: italic;">No medicines prescribed yet. Use the search bar above to add medicines.</div>'}
            </div>

            <div style="border: 2px solid #000; padding: 20px;">
              <h3 style="margin: 0 0 15px 0;">DOCTOR'S SIGNATURE</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div><strong>Dr. Name:</strong> ${doctorName}</div>
                <div><strong>Registration No:</strong> ${regNo}</div>
                <div><strong>Signature:</strong> _______________________</div>
                <div><strong>Date:</strong> ${date}</div>
              </div>
            </div>
          </div>
        `

      case 'consultation':
        return `
          <div style="font-family: Arial, sans-serif; padding: 40px; background: white;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="/ch logo.png" alt="CURA HOSPITALS" style="height: 80px; margin: 0 auto 10px auto; display: block;" />
              <p style="margin: 5px 0;">Bengaluru, Karnataka</p>
              <h2 style="color: #0066CC; margin: 10px 0;">CONSULTATION NOTES</h2>
            </div>
            
            <div style="border: 2px solid #000; padding: 20px; margin-bottom: 20px;">
              <h3 style="margin: 0 0 15px 0;">PATIENT INFORMATION</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div><strong>Name:</strong> ${patientName}</div>
                <div><strong>MR No:</strong> ${mrNo}</div>
                <div><strong>Date:</strong> ${date}</div>
                <div><strong>Time:</strong> ${time}</div>
              </div>
            </div>

            <div style="border: 2px solid #000; padding: 20px; min-height: 150px; margin-bottom: 20px;">
              <h3 style="margin: 0 0 15px 0;">CHIEF COMPLAINT</h3>
              <div style="height: 100px;"></div>
            </div>

            <div style="border: 2px solid #000; padding: 20px; min-height: 200px; margin-bottom: 20px;">
              <h3 style="margin: 0 0 15px 0;">HISTORY OF PRESENT ILLNESS</h3>
              <div style="height: 150px;"></div>
            </div>

            <div style="border: 2px solid #000; padding: 20px; min-height: 200px; margin-bottom: 20px;">
              <h3 style="margin: 0 0 15px 0;">PHYSICAL EXAMINATION</h3>
              <div style="height: 150px;"></div>
            </div>

            <div style="border: 2px solid #000; padding: 20px; min-height: 200px; margin-bottom: 20px;">
              <h3 style="margin: 0 0 15px 0;">DIAGNOSIS</h3>
              <div style="height: 150px;"></div>
            </div>

            <div style="border: 2px solid #000; padding: 20px;">
              <h3 style="margin: 0 0 15px 0;">DOCTOR'S SIGNATURE</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div><strong>Dr. Name:</strong> ${doctorName}</div>
                <div><strong>Registration No:</strong> ${regNo}</div>
                <div><strong>Signature:</strong> _______________________</div>
                <div><strong>Date:</strong> ${date}</div>
              </div>
            </div>
          </div>
        `

      case 'laboratory':
        // Generate tests list HTML
        const testsHTML = selectedTests.map((test, index) => `
          <div style="margin-bottom: 15px; padding: 10px; background: #f0f8ff; border-left: 3px solid ${test.type === 'lab' ? '#0066CC' : '#00CC66'};">
            <div style="font-weight: bold; font-size: 14px; margin-bottom: 5px;">
              ☑ ${test.name} ${test.type === 'radiology' ? '(Radiology)' : '(Lab)'}
            </div>
            ${test.price ? `<div style="margin-left: 20px; font-size: 12px; color: #666;">Price: ₹${test.price}</div>` : ''}
          </div>
        `).join('')

        return `
          <div style="font-family: Arial, sans-serif; padding: 40px; background: white;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="/ch logo.png" alt="CURA HOSPITALS" style="height: 80px; margin: 0 auto 10px auto; display: block;" />
              <p style="margin: 5px 0;">Bengaluru, Karnataka</p>
              <h2 style="color: #0066CC; margin: 10px 0;">LABORATORY REQUEST</h2>
            </div>
            
            <div style="border: 2px solid #000; padding: 20px; margin-bottom: 20px;">
              <h3 style="margin: 0 0 15px 0;">PATIENT INFORMATION</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
                <div><strong>Name:</strong> ${patientName}</div>
                <div><strong>Age:</strong> ${age}</div>
                <div><strong>Gender:</strong> ${gender}</div>
                <div style="grid-column: 1 / 3;"><strong>MR No:</strong> ${mrNo}</div>
                <div><strong>Date:</strong> ${date}</div>
                <div style="grid-column: 1 / 4;"><strong>Phone:</strong> ${phone}</div>
              </div>
            </div>

            <div style="border: 2px solid #000; padding: 20px; min-height: 400px; margin-bottom: 20px;">
              <h3 style="margin: 0 0 15px 0;">REQUESTED TESTS</h3>
              ${testsHTML || '<div style="color: #999; font-style: italic;">No tests selected yet. Use the search bar above to add tests.</div>'}
            </div>

            <div style="border: 2px solid #000; padding: 20px; min-height: 150px; margin-bottom: 20px;">
              <h3 style="margin: 0 0 15px 0;">CLINICAL HISTORY</h3>
              <div style="height: 100px;"></div>
            </div>

            <div style="border: 2px solid #000; padding: 20px;">
              <h3 style="margin: 0 0 15px 0;">DOCTOR'S SIGNATURE</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div><strong>Dr. Name:</strong> ${doctorName}</div>
                <div><strong>Registration No:</strong> ${regNo}</div>
                <div><strong>Signature:</strong> _______________________</div>
                <div><strong>Date:</strong> ${date}</div>
              </div>
            </div>
          </div>
        `

      case 'certificate':
        return `
          <div style="font-family: Arial, sans-serif; padding: 40px; background: white;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="/ch logo.png" alt="CURA HOSPITALS" style="height: 80px; margin: 0 auto 10px auto; display: block;" />
              <p style="margin: 5px 0;">Bengaluru, Karnataka</p>
              <h2 style="color: #0066CC; margin: 10px 0;">MEDICAL CERTIFICATE</h2>
            </div>
            
            <div style="border: 2px solid #000; padding: 40px; min-height: 700px; margin-bottom: 20px;">
              <p style="margin: 20px 0;">This is to certify that</p>
              <p style="margin: 20px 0;"><strong>Mr./Ms. ${patientName}</strong></p>
              <p style="margin: 20px 0;"><strong>Age:</strong> ${age} years, <strong>Gender:</strong> ${gender}</p>
              <p style="margin: 20px 0;"><strong>MR No:</strong> ${mrNo}</p>
              <p style="margin: 40px 0;">was examined by me on _________________ and found to be</p>
              <div style="height: 300px; margin: 40px 0;"></div>
              <p style="margin: 40px 0;">He/She is advised rest for _______ days from _______ to _______</p>
            </div>

            <div style="border: 2px solid #000; padding: 20px;">
              <h3 style="margin: 0 0 15px 0;">DOCTOR'S SIGNATURE</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div><strong>Date:</strong> ${date}</div>
                <div><strong>Dr. ${doctorName}</strong></div>
                <div><strong>Registration No:</strong> ${regNo}</div>
                <div><strong>Signature:</strong> _______________________</div>
              </div>
            </div>
          </div>
        `

      default:
        return '<div>Form template not found</div>'
    }
  }

  const handleClear = () => {
    if (canvasRef.current) {
      canvasRef.current.clear()
    }
  }

  const drawFormTemplate = async (ctx) => {
    // Load logo image
    const logo = new Image()
    logo.src = '/ch logo.png'
    await new Promise((resolve) => {
      logo.onload = resolve
      logo.onerror = resolve // Continue even if logo fails to load
    })
    const patientName = appointmentData?.patient_name || 'Patient Name'
    const mrNo = appointmentData?.mr_no || 'fa04f319-80db-49df-ae8b-07ede794e61d'
    const age = appointmentData?.age || '21'
    const gender = appointmentData?.gender || 'Male'
    const phone = appointmentData?.phone || '9717963909'
    const date = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
    const doctorName = appointmentData?.doctor_name || 'Dr. Rajesh Kumar'
    const regNo = appointmentData?.registration_no || ''

    // Set up fonts and colors
    ctx.fillStyle = '#000000'
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2

    // Header - Draw logo
    if (logo.complete && logo.naturalHeight !== 0) {
      const logoHeight = 60
      const logoWidth = (logo.width / logo.height) * logoHeight
      ctx.drawImage(logo, (794 - logoWidth) / 2, 30, logoWidth, logoHeight)
    }
    
    ctx.font = '14px Arial'
    ctx.fillStyle = '#000000'
    ctx.textAlign = 'center'
    ctx.fillText('Bengaluru, Karnataka', 397, 105)
    
    ctx.font = 'bold 20px Arial'
    ctx.fillStyle = '#0066CC'
    const title = formType === 'prescription' ? 'PRESCRIPTION' :
                  formType === 'consultation' ? 'CONSULTATION NOTES' :
                  formType === 'laboratory' ? 'LABORATORY REQUEST' :
                  'MEDICAL CERTIFICATE'
    ctx.fillText(title, 397, 135)

    // Reset styles
    ctx.fillStyle = '#000000'
    ctx.textAlign = 'left'
    ctx.font = '12px Arial'

    // Draw based on form type
    if (formType === 'prescription') {
      // Patient Info Box
      ctx.strokeRect(60, 180, 674, 140)
      ctx.font = 'bold 14px Arial'
      ctx.fillText('PATIENT INFORMATION', 75, 205)
      ctx.font = '12px Arial'
      ctx.fillText(`Name: ${patientName}`, 75, 235)
      ctx.fillText(`Age: ${age} years`, 340, 235)
      ctx.fillText(`Gender: ${gender}`, 540, 235)
      ctx.fillText(`MR No: ${mrNo}`, 75, 260)
      ctx.fillText(`Date: ${date}`, 540, 260)
      ctx.fillText(`Phone: ${phone}`, 75, 285)

      // Prescription Box
      ctx.strokeRect(60, 340, 674, 600)
      ctx.font = 'bold 14px Arial'
      ctx.fillText('PRESCRIPTION', 75, 365)
      
      // Draw selected medicines
      ctx.font = '12px Arial'
      let yPos = 395
      selectedMedicines.forEach((med, index) => {
        ctx.fillText(`${index + 1}. ${med.name}`, 85, yPos)
        if (med.dosage) ctx.fillText(`   Dosage: ${med.dosage}`, 85, yPos + 20)
        if (med.duration) ctx.fillText(`   Duration: ${med.duration}`, 85, yPos + 40)
        if (med.instructions) ctx.fillText(`   Instructions: ${med.instructions}`, 85, yPos + 60)
        yPos += 90
      })

      // Doctor Signature Box
      ctx.strokeRect(60, 960, 674, 100)
      ctx.font = 'bold 14px Arial'
      ctx.fillText("DOCTOR'S SIGNATURE", 75, 985)
      ctx.font = '12px Arial'
      ctx.fillText(`Dr. Name: ${doctorName}`, 75, 1010)
      ctx.fillText(`Registration No: ${regNo}`, 400, 1010)
      ctx.fillText('Signature: _______________________', 75, 1040)
      ctx.fillText(`Date: ${date}`, 400, 1040)
    } else if (formType === 'consultation') {
      // Patient Info
      ctx.strokeRect(60, 180, 674, 80)
      ctx.font = 'bold 14px Arial'
      ctx.fillText('PATIENT INFORMATION', 75, 205)
      ctx.font = '12px Arial'
      ctx.fillText(`Name: ${patientName}`, 75, 230)
      ctx.fillText(`MR No: ${mrNo}`, 400, 230)
      ctx.fillText(`Date: ${date}`, 75, 250)
      ctx.fillText(`Time: ${new Date().toLocaleTimeString()}`, 400, 250)

      // Chief Complaint
      ctx.strokeRect(60, 280, 674, 100)
      ctx.font = 'bold 14px Arial'
      ctx.fillText('CHIEF COMPLAINT', 75, 305)

      // History
      ctx.strokeRect(60, 400, 674, 120)
      ctx.font = 'bold 14px Arial'
      ctx.fillText('HISTORY OF PRESENT ILLNESS', 75, 425)

      // Physical Exam
      ctx.strokeRect(60, 540, 674, 120)
      ctx.font = 'bold 14px Arial'
      ctx.fillText('PHYSICAL EXAMINATION', 75, 565)

      // Diagnosis
      ctx.strokeRect(60, 680, 674, 120)
      ctx.font = 'bold 14px Arial'
      ctx.fillText('DIAGNOSIS', 75, 705)

      // Signature
      ctx.strokeRect(60, 820, 674, 100)
      ctx.font = 'bold 14px Arial'
      ctx.fillText("DOCTOR'S SIGNATURE", 75, 845)
      ctx.font = '12px Arial'
      ctx.fillText(`Dr. Name: ${doctorName}`, 75, 870)
      ctx.fillText(`Date: ${date}`, 75, 900)
    } else if (formType === 'laboratory') {
      // Patient Info
      ctx.strokeRect(60, 180, 674, 100)
      ctx.font = 'bold 14px Arial'
      ctx.fillText('PATIENT INFORMATION', 75, 205)
      ctx.font = '12px Arial'
      ctx.fillText(`Name: ${patientName}`, 75, 230)
      ctx.fillText(`Age: ${age}`, 340, 230)
      ctx.fillText(`Gender: ${gender}`, 540, 230)
      ctx.fillText(`MR No: ${mrNo}`, 75, 255)
      ctx.fillText(`Date: ${date}`, 540, 255)

      // Tests
      ctx.strokeRect(60, 300, 674, 400)
      ctx.font = 'bold 14px Arial'
      ctx.fillText('REQUESTED TESTS', 75, 325)
      
      // Draw selected tests
      ctx.font = '12px Arial'
      let yPos = 355
      selectedTests.forEach((test, index) => {
        // Draw checkbox
        ctx.fillText(`☑ ${test.name}`, 85, yPos)
        ctx.font = '10px Arial'
        ctx.fillStyle = '#666666'
        ctx.fillText(`(${test.type === 'lab' ? 'Lab Test' : 'Radiology'}) - ₹${test.price}`, 95, yPos + 15)
        ctx.fillStyle = '#000000'
        ctx.font = '12px Arial'
        yPos += 35
      })

      // Clinical History
      ctx.strokeRect(60, 720, 674, 100)
      ctx.font = 'bold 14px Arial'
      ctx.fillText('CLINICAL HISTORY', 75, 745)

      // Signature
      ctx.strokeRect(60, 840, 674, 100)
      ctx.font = 'bold 14px Arial'
      ctx.fillText("DOCTOR'S SIGNATURE", 75, 865)
      ctx.font = '12px Arial'
      ctx.fillText(`Dr. Name: ${doctorName}`, 75, 890)
      ctx.fillText(`Date: ${date}`, 75, 920)
    } else if (formType === 'certificate') {
      ctx.strokeRect(60, 200, 674, 700)
      ctx.font = '12px Arial'
      ctx.fillText('This is to certify that', 80, 240)
      ctx.fillText(`Mr./Ms. ${patientName}`, 80, 280)
      ctx.fillText(`Age: ${age} years, Gender: ${gender}`, 80, 310)
      ctx.fillText(`MR No: ${mrNo}`, 80, 340)
      ctx.fillText('was examined by me on _________________ and found to be', 80, 400)
      ctx.fillText('He/She is advised rest for _______ days from _______ to _______', 80, 750)

      // Signature
      ctx.strokeRect(60, 920, 674, 100)
      ctx.font = 'bold 14px Arial'
      ctx.fillText("DOCTOR'S SIGNATURE", 75, 945)
      ctx.font = '12px Arial'
      ctx.fillText(`Date: ${date}`, 75, 970)
      ctx.fillText(`Dr. ${doctorName}`, 400, 970)
      ctx.fillText(`Registration No: ${regNo}`, 75, 1000)
    }
  }

  const handleSave = async () => {
    if (!canvasRef.current) return

    setIsSaving(true)
    try {
      // Create a new canvas for the final merged image
      const finalCanvas = document.createElement('canvas')
      finalCanvas.width = 794
      finalCanvas.height = 1123
      const ctx = finalCanvas.getContext('2d')

      // Fill white background
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, 794, 1123)

      // Draw the form template directly on canvas
      await drawFormTemplate(ctx)

      // Draw the signature/drawing canvas on top
      const signatureCanvas = canvasRef.current.getCanvas()
      ctx.drawImage(signatureCanvas, 0, 0, 794, 1123)

      // Get the merged image as base64
      const imageData = finalCanvas.toDataURL('image/png', 1.0)
      
      // Convert IDs to proper format
      const appointmentId = appointmentData?.appointment_id
      const patientId = appointmentData?.patient_id
      const doctorId = appointmentData?.doctor_id
      
      // Save to Supabase
      const formData = {
        appointment_id: appointmentId ? String(appointmentId) : null,
        patient_id: patientId ? String(patientId) : null,
        doctor_id: doctorId ? String(doctorId) : null,
        form_type: formType,
        form_data: imageData,
        created_at: new Date().toISOString()
      }

      console.log('Saving form with data:', { ...formData, form_data: 'base64_image...' })

      const { data, error } = await supabase
        .from('medical_forms')
        .insert([formData])
        .select()

      if (error) {
        console.error('Error saving form:', error)
        alert('Error saving form: ' + error.message)
        return
      }

      console.log('Form saved successfully:', data)
      
      // Save prescribed medicines if prescription form
      if (formType === 'prescription' && selectedMedicines.length > 0) {
        const formId = data[0].id
        const prescribedMeds = selectedMedicines.map(med => ({
          form_id: formId,
          appointment_id: appointmentId ? String(appointmentId) : null,
          patient_id: patientId ? String(patientId) : null,
          doctor_id: doctorId ? String(doctorId) : null,
          medicine_id: med.id,
          medicine_name: med.name,
          dosage: med.dosage || '',
          duration: med.duration || '',
          instructions: med.instructions || '',
          created_at: new Date().toISOString()
        }))

        const { error: medError } = await supabase
          .from('prescribed_medicines')
          .insert(prescribedMeds)

        if (medError) {
          console.error('Error saving prescribed medicines:', medError)
        } else {
          console.log('Prescribed medicines saved successfully')
        }
      }

      // Save prescribed tests if laboratory form
      if (formType === 'laboratory' && selectedTests.length > 0) {
        const formId = data[0].id
        const prescribedTests = selectedTests.map(test => ({
          form_id: formId,
          appointment_id: appointmentId ? String(appointmentId) : null,
          patient_id: patientId ? String(patientId) : null,
          doctor_id: doctorId ? String(doctorId) : null,
          test_id: test.id,
          test_name: test.name,
          test_type: test.type,
          price: test.price || 0,
          created_at: new Date().toISOString()
        }))

        const { error: testError } = await supabase
          .from('prescribed_tests')
          .insert(prescribedTests)

        if (testError) {
          console.error('Error saving prescribed tests:', testError)
        } else {
          console.log('Prescribed tests saved successfully')
        }
      }
      
      alert('Form saved successfully!')
      onSave && onSave(data)
      onClose()
      
    } catch (err) {
      console.error('Error in handleSave:', err)
      alert('Error saving form: ' + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {formType === 'prescription' && 'Prescription Form'}
              {formType === 'consultation' && 'Consultation Notes'}
              {formType === 'laboratory' && 'Laboratory Request'}
              {formType === 'certificate' && 'Medical Certificate'}
            </h2>
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

        {/* Toolbar */}
        <div className="flex items-center gap-4 p-4 border-b border-gray-200 bg-gray-50 flex-wrap">
          {formType === 'prescription' && (
            <div className="relative flex-1 min-w-[300px]">
              <input
                type="text"
                placeholder="Search and add medicines..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setShowMedicineDropdown(true)
                }}
                onFocus={() => setShowMedicineDropdown(true)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cura-primary focus:border-transparent outline-none"
              />
              {showMedicineDropdown && filteredMedicines.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
                  {filteredMedicines.map((med) => (
                    <button
                      key={med.id}
                      onClick={() => addMedicine(med)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-0"
                    >
                      <div className="font-medium text-gray-900">{med.name}</div>
                      <div className="text-sm text-gray-600">Price: ₹{med.price} | Stock: {med.quantity}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {formType === 'laboratory' && (
            <div className="relative flex-1 min-w-[300px]">
              <input
                type="text"
                placeholder="Search and add lab/radiology tests..."
                value={testSearchTerm}
                onChange={(e) => {
                  setTestSearchTerm(e.target.value)
                  setShowTestDropdown(true)
                }}
                onFocus={() => setShowTestDropdown(true)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cura-primary focus:border-transparent outline-none"
              />
              {showTestDropdown && filteredTests.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
                  {filteredTests.map((test) => (
                    <button
                      key={`${test.type}-${test.id}`}
                      onClick={() => addTest(test)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-0"
                    >
                      <div className="font-medium text-gray-900">{test.name}</div>
                      <div className="text-sm text-gray-600">
                        {test.type === 'lab' ? '🧪 Lab Test' : '📷 Radiology'} | Price: ₹{test.price}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEraser(false)}
              className={`p-2 rounded-lg transition-colors ${!isEraser ? 'bg-cura-primary text-white' : 'bg-white hover:bg-gray-100'}`}
            >
              <Pen className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsEraser(true)}
              className={`p-2 rounded-lg transition-colors ${isEraser ? 'bg-cura-primary text-white' : 'bg-white hover:bg-gray-100'}`}
            >
              <Eraser className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Color:</label>
            <input
              type="color"
              value={penColor}
              onChange={(e) => setPenColor(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer"
              disabled={isEraser}
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Width:</label>
            <input
              type="range"
              min="1"
              max="10"
              value={penWidth}
              onChange={(e) => setPenWidth(parseInt(e.target.value))}
              className="w-32"
            />
            <span className="text-sm text-gray-600 w-8">{penWidth}px</span>
          </div>

          <button
            onClick={handleClear}
            className="ml-auto flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Clear
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-cura-primary to-cura-secondary text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Form'}
          </button>
        </div>

        {/* Selected Tests Panel */}
        {formType === 'laboratory' && selectedTests.length > 0 && (
          <div className="p-4 border-b border-gray-200 bg-green-50 max-h-48 overflow-y-auto">
            <h3 className="font-bold text-sm text-gray-900 mb-2">Selected Tests:</h3>
            <div className="flex flex-wrap gap-2">
              {selectedTests.map((test) => (
                <div key={`${test.type}-${test.id}`} className="bg-white px-3 py-2 rounded-lg border border-gray-200 flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {test.type === 'lab' ? '🧪' : '📷'} {test.name}
                  </span>
                  <button
                    onClick={() => removeTest(test.id, test.type)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Medicines Panel */}
        {formType === 'prescription' && selectedMedicines.length > 0 && (
          <div className="p-4 border-b border-gray-200 bg-blue-50 max-h-48 overflow-y-auto">
            <h3 className="font-bold text-sm text-gray-900 mb-2">Selected Medicines:</h3>
            <div className="space-y-2">
              {selectedMedicines.map((med) => (
                <div key={med.id} className="bg-white p-3 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-medium text-gray-900">{med.name}</span>
                    <button
                      onClick={() => removeMedicine(med.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Dosage"
                      value={med.dosage}
                      onChange={(e) => updateMedicineDetails(med.id, 'dosage', e.target.value)}
                      className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-cura-primary outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Duration"
                      value={med.duration}
                      onChange={(e) => updateMedicineDetails(med.id, 'duration', e.target.value)}
                      className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-cura-primary outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Instructions"
                      value={med.instructions}
                      onChange={(e) => updateMedicineDetails(med.id, 'instructions', e.target.value)}
                      className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-cura-primary outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Canvas Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 bg-gray-100">
          <div className="bg-white shadow-lg mx-auto" style={{ width: '794px', minHeight: '1123px' }}>
            <div ref={formContainerRef} style={{ position: 'relative', width: '794px', height: '1123px' }}>
              {/* Form Template Background */}
              <div 
                dangerouslySetInnerHTML={{ __html: getFormTemplate() }}
                style={{ 
                  position: 'absolute', 
                  pointerEvents: 'none', 
                  width: '794px',
                  height: '1123px',
                  top: 0,
                  left: 0,
                  zIndex: 1
                }}
              />
              
              {/* Drawing Canvas */}
              <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 2 }}>
                <SignatureCanvas
                  ref={canvasRef}
                  canvasProps={{
                    width: 794,
                    height: 1123,
                    className: 'signature-canvas',
                    style: { touchAction: 'none' }
                  }}
                  penColor={isEraser ? '#FFFFFF' : penColor}
                  minWidth={penWidth}
                  maxWidth={penWidth}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MedicalFormCanvas
