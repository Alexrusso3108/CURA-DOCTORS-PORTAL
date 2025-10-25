-- Fix medicines table access
-- Run this in your Supabase SQL Editor

-- Check if RLS is enabled and add policy
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow read access to medicines" ON medicines;

-- Create policy to allow anyone to read medicines
CREATE POLICY "Allow read access to medicines" 
ON medicines FOR SELECT 
USING (true);

-- If you also want to allow insert/update (for admin)
CREATE POLICY "Allow all access to medicines" 
ON medicines FOR ALL 
USING (true);
