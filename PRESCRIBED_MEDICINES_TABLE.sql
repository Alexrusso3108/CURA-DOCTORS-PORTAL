-- Create prescribed_medicines table
-- Run this in your Supabase SQL Editor

CREATE TABLE prescribed_medicines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID REFERENCES medical_forms(id) ON DELETE CASCADE,
  appointment_id TEXT,
  patient_id TEXT,
  doctor_id TEXT,
  medicine_id INTEGER,
  medicine_name TEXT NOT NULL,
  dosage TEXT,
  duration TEXT,
  instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_prescribed_medicines_form ON prescribed_medicines(form_id);
CREATE INDEX idx_prescribed_medicines_appointment ON prescribed_medicines(appointment_id);
CREATE INDEX idx_prescribed_medicines_patient ON prescribed_medicines(patient_id);
CREATE INDEX idx_prescribed_medicines_medicine ON prescribed_medicines(medicine_id);

-- Enable RLS
ALTER TABLE prescribed_medicines ENABLE ROW LEVEL SECURITY;

-- Allow all operations (adjust based on your security needs)
CREATE POLICY "Allow all" ON prescribed_medicines FOR ALL USING (true);
