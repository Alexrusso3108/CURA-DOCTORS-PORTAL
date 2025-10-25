-- Create prescribed_tests table
-- Run this in your Supabase SQL Editor

CREATE TABLE prescribed_tests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID REFERENCES medical_forms(id) ON DELETE CASCADE,
  appointment_id TEXT,
  patient_id TEXT,
  doctor_id TEXT,
  test_id INTEGER,
  test_name TEXT NOT NULL,
  test_type TEXT NOT NULL, -- 'lab' or 'radiology'
  price NUMERIC(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_prescribed_tests_form ON prescribed_tests(form_id);
CREATE INDEX idx_prescribed_tests_appointment ON prescribed_tests(appointment_id);
CREATE INDEX idx_prescribed_tests_patient ON prescribed_tests(patient_id);
CREATE INDEX idx_prescribed_tests_test ON prescribed_tests(test_id);
CREATE INDEX idx_prescribed_tests_type ON prescribed_tests(test_type);

-- Enable RLS
ALTER TABLE prescribed_tests ENABLE ROW LEVEL SECURITY;

-- Allow all operations (adjust based on your security needs)
CREATE POLICY "Allow all" ON prescribed_tests FOR ALL USING (true);
