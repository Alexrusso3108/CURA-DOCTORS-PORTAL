-- Quick fix for medical_forms table
-- Run this in your Supabase SQL Editor

-- Drop the table if it exists
DROP TABLE IF EXISTS medical_forms;

-- Create medical_forms table with TEXT for IDs (handles both UUIDs and integers)
CREATE TABLE medical_forms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id TEXT,
  patient_id TEXT,
  doctor_id TEXT,
  form_type TEXT CHECK (form_type IN ('prescription', 'consultation', 'laboratory', 'certificate')),
  form_data TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_medical_forms_appointment ON medical_forms(appointment_id);
CREATE INDEX idx_medical_forms_patient ON medical_forms(patient_id);
CREATE INDEX idx_medical_forms_doctor ON medical_forms(doctor_id);

-- Enable RLS
ALTER TABLE medical_forms ENABLE ROW LEVEL SECURITY;

-- Allow all operations (adjust based on your security needs)
CREATE POLICY "Allow all" ON medical_forms FOR ALL USING (true);
