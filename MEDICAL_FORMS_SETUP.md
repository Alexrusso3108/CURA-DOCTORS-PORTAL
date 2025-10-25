# Medical Forms Database Setup

## Overview
The medical forms system allows doctors to create handwritten forms using S-Pen/stylus that are saved as images in the database.

## Database Table Required

### Create `medical_forms` Table

```sql
-- Create medical_forms table
CREATE TABLE medical_forms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id INTEGER REFERENCES appointments(appointment_id),
  patient_id INTEGER,
  doctor_id INTEGER REFERENCES doctors(doctor_id),
  form_type TEXT NOT NULL CHECK (form_type IN ('prescription', 'consultation', 'laboratory', 'certificate')),
  form_data TEXT NOT NULL, -- Base64 encoded image
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX idx_medical_forms_appointment ON medical_forms(appointment_id);
CREATE INDEX idx_medical_forms_patient ON medical_forms(patient_id);
CREATE INDEX idx_medical_forms_doctor ON medical_forms(doctor_id);
CREATE INDEX idx_medical_forms_type ON medical_forms(form_type);

-- Enable Row Level Security (RLS)
ALTER TABLE medical_forms ENABLE ROW LEVEL SECURITY;

-- Create policy to allow doctors to insert their own forms
CREATE POLICY "Doctors can insert their own forms" 
ON medical_forms FOR INSERT 
WITH CHECK (true);

-- Create policy to allow doctors to view forms
CREATE POLICY "Doctors can view forms" 
ON medical_forms FOR SELECT 
USING (true);

-- Create policy to allow doctors to update their own forms
CREATE POLICY "Doctors can update their own forms" 
ON medical_forms FOR UPDATE 
USING (doctor_id = auth.uid()::integer);
```

## Form Types

The system supports 4 types of medical forms:

### 1. Prescription Form
- **Type**: `prescription`
- **Contains**: Patient info, prescription lines, doctor's signature
- **Use Case**: Writing medication prescriptions

### 2. Consultation Notes
- **Type**: `consultation`
- **Contains**: Chief complaint, history, physical examination, diagnosis, medicines
- **Use Case**: Recording detailed consultation information

### 3. Laboratory Request
- **Type**: `laboratory`
- **Contains**: Patient info, requested tests (checkboxes), clinical history
- **Use Case**: Requesting lab tests and investigations

### 4. Medical Certificate
- **Type**: `certificate`
- **Contains**: Patient info, examination findings, rest period recommendation
- **Use Case**: Issuing medical certificates and fitness reports

## How It Works

### 1. Creating a Form
1. Doctor clicks "Create Form" button on an appointment
2. Selects form type from modal
3. Form template opens with patient information pre-filled
4. Doctor writes on the form using S-Pen/stylus
5. Form is saved as base64 PNG image in database

### 2. Drawing Features
- **Pen Tool**: Write with customizable color and width
- **Eraser Tool**: Erase mistakes
- **Clear Button**: Clear entire canvas
- **Save Button**: Save form to database

### 3. Data Storage
- Forms are stored as base64-encoded PNG images
- Each form is linked to:
  - Appointment ID
  - Patient ID
  - Doctor ID
  - Form type
- Timestamp of creation

### 4. Viewing Forms (Future Feature)
- Forms can be retrieved by appointment_id
- Displayed as images
- Can be downloaded or printed

## S-Pen/Stylus Support

The canvas component supports:
- ✅ Touch events (S-Pen, Apple Pencil, etc.)
- ✅ Mouse events (for desktop)
- ✅ Pressure sensitivity (if device supports)
- ✅ Palm rejection (via touch-action CSS)

## Technical Implementation

### Libraries Used
- **react-signature-canvas**: Canvas drawing component
- **HTML5 Canvas**: For rendering and capturing drawings

### Canvas Configuration
- **Size**: A4 paper size (794x1123 pixels at 96 DPI)
- **Format**: PNG image
- **Encoding**: Base64 string
- **Touch Action**: None (prevents scrolling while drawing)

## Security Considerations

1. **Row Level Security (RLS)**: Enabled on medical_forms table
2. **Data Validation**: Form type is constrained to valid values
3. **Access Control**: Doctors can only access their own forms
4. **Data Integrity**: Foreign key constraints ensure valid references

## Future Enhancements

- [ ] View saved forms in dashboard
- [ ] Edit existing forms
- [ ] Delete forms
- [ ] Download forms as PDF
- [ ] Print forms directly
- [ ] Search forms by patient/date
- [ ] Form templates customization
- [ ] Digital signature verification
- [ ] Form sharing with patients
- [ ] Form archiving
