# Database Setup Instructions

## Supabase Configuration

The application is configured to connect to your Supabase database:
- **Project URL**: https://tcpzfkrpyjgsfrzxddta.supabase.co
- **Environment variables** are stored in `.env` file

## Required Database Table

You need to create a `doctors` table in your Supabase database with the following structure:

### SQL to Create Table

```sql
-- Create doctors table
CREATE TABLE doctors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  specialization TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on doctor_id for faster lookups
CREATE INDEX idx_doctors_doctor_id ON doctors(doctor_id);

-- Enable Row Level Security (RLS)
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

-- Create policy to allow reading doctor data
CREATE POLICY "Allow public read access to doctors" 
ON doctors FOR SELECT 
USING (true);
```

### Sample Data

```sql
-- Insert sample doctor (you'll need to create this user in Supabase Auth first)
INSERT INTO doctors (doctor_id, name, email, specialization, phone)
VALUES 
  ('DOC001', 'Dr. Rajesh Kumar', 'rajesh.kumar@curahospitals.com', 'Cardiology', '+91-9876543210'),
  ('DOC002', 'Dr. Priya Sharma', 'priya.sharma@curahospitals.com', 'Pediatrics', '+91-9876543211'),
  ('DOC003', 'Dr. Amit Patel', 'amit.patel@curahospitals.com', 'Orthopedics', '+91-9876543212');
```

## Setting Up Authentication

For each doctor, you need to:

1. **Create a user in Supabase Auth**:
   - Go to Supabase Dashboard → Authentication → Users
   - Click "Add User"
   - Enter the doctor's email (must match the email in doctors table)
   - Set a password
   - Confirm the user's email

2. **Or use SQL to create auth users**:
```sql
-- This is done through Supabase Dashboard or using Admin API
-- The email must match the email in the doctors table
```

## How Authentication Works

1. User enters their **Doctor ID** (e.g., DOC001)
2. System queries the `doctors` table to find the associated email
3. System attempts to authenticate using the email and password via Supabase Auth
4. On success, user is logged in and can access the dashboard

## Testing the Login

1. Create a test doctor in the `doctors` table
2. Create a corresponding user in Supabase Auth with the same email
3. Use the Doctor ID and password to log in

Example:
- **Doctor ID**: DOC001
- **Password**: (whatever you set in Supabase Auth)

## Security Notes

- The `.env` file contains your Supabase keys and is gitignored
- Never commit the `.env` file to version control
- The anon key is safe to use in the frontend
- Row Level Security (RLS) should be enabled on all tables
