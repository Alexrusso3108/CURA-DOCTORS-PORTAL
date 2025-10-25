# Appointments Integration

## Overview
The dashboard now fetches real appointments from your Supabase `appointments` table.

## How It Works

### 1. Data Fetching
- When a doctor logs in, their `doctor_id` is used to fetch appointments
- Appointments are fetched from the `appointments` table using:
  ```javascript
  supabase
    .from('appointments')
    .select('*')
    .eq('doctor_id', doctorId)
    .order('appointment_date', { ascending: true })
    .order('appointment_time', { ascending: true })
  ```

### 2. Expected Table Structure
The code expects the following columns in your `appointments` table:
- `appointment_id` - Unique identifier
- `doctor_id` - Links to the doctor
- `patient_id` - Patient identifier
- `patient_name` - Patient's name (optional, will show "Patient {id}" if missing)
- `appointment_date` - Date in YYYY-MM-DD format
- `appointment_time` - Time in HH:MM format
- `appointment_type` or `reason` - Type of appointment
- `status` - Status (e.g., 'scheduled', 'completed', 'ongoing', 'cancelled')

### 3. Dashboard Features

#### Overview Tab
- Shows **today's appointments only** (filtered by current date)
- Displays up to 4 appointments
- Shows statistics:
  - Total appointments today
  - Completed appointments today

#### Appointments Tab
- Shows **all appointments** for the doctor
- Displays full details including date and time
- Color-coded status badges:
  - 🟢 Green - Completed
  - 🔵 Blue - Ongoing
  - 🟡 Yellow - Scheduled
  - 🔴 Red - Cancelled

### 4. Loading States
- Shows a spinner while fetching data
- Shows "No appointments found" message if table is empty

## Testing

1. **Login** as a doctor (e.g., Doctor ID: 1)
2. Check the **Overview** tab - should show today's appointments
3. Click **"View All"** or navigate to **Appointments** tab to see all appointments
4. Check browser console for fetched data: `console.log('Fetched appointments:', data)`

## Troubleshooting

### No appointments showing?
1. Check if appointments exist in your table for this doctor_id
2. Check browser console for errors
3. Verify the doctor_id matches between doctors and appointments tables
4. Ensure Row Level Security (RLS) policies allow reading appointments

### Wrong data displayed?
- Verify column names match what's expected
- Check the console log to see the actual data structure
- Adjust the code if your column names are different

## Future Enhancements
- Add patient details lookup (join with patients table)
- Add filtering by date range
- Add search functionality
- Add ability to update appointment status
- Add appointment creation form
