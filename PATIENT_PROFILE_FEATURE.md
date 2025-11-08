# Patient Profile & Management Feature

## Overview
Comprehensive patient management system with individual patient profiles and integrated billing functionality. Allows doctors to view patient information, appointment history, billing records, and create new bills directly from the patient profile.

## Components

### 1. PatientsList Component (`src/components/PatientsList.jsx`)

**Purpose**: Main patients directory showing all patients with search functionality.

#### Features
- **Patient Cards Grid**: Displays all unique patients in a responsive grid
- **Search Functionality**: Search by name, MR number, phone, or email
- **Patient Statistics**: Shows total visits and last visit date
- **Quick Actions**: View profile button for each patient
- **Auto-aggregation**: Automatically groups appointments by patient

#### Patient Card Information
- Patient avatar with initial
- Full name
- MR Number (truncated)
- Phone number
- Email address
- Age and gender
- Total visit count
- Last visit date
- View profile button

### 2. PatientProfile Component (`src/components/PatientProfile.jsx`)

**Purpose**: Detailed patient profile with comprehensive information and billing integration.

#### Sections

**Header Section**
- Back button to return to patients list
- **Add Bill button** (prominent, top-right)
- Patient avatar and name
- MR Number
- Age and gender
- Contact information (phone, email)

**Statistics Cards** (4 cards)
1. **Total Visits**: Count of all appointments
2. **Total Billed**: Sum of all bill amounts
3. **Total Paid**: Sum of all paid amounts
4. **Balance Due**: Sum of all outstanding amounts

**Tabbed Interface** (3 tabs)

1. **Overview Tab**
   - Recent Appointments (last 3)
     - Date, time, reason
     - Status badge
   - Recent Bills (last 3)
     - Bill number
     - Service name
     - Amount
     - Payment status

2. **Appointments Tab**
   - Complete appointment history
   - Date, time, status
   - Reason for visit
   - Doctor name
   - Status badges (completed, scheduled, cancelled)

3. **Billing History Tab**
   - All bills for the patient
   - Bill number and date
   - Service details
   - Amount breakdown (total, paid, due)
   - View Details button
   - Empty state with "Create First Bill" button

### 3. Integration Features

#### Add Bill from Patient Profile
- **Location**: Top-right of patient profile
- **Pre-filled Data**: Patient MR number automatically populated
- **Workflow**:
  1. Click "Add Bill" button
  2. AddBillModal opens with patient ID pre-filled
  3. Fill in service and pricing details
  4. Submit to create bill
  5. Profile refreshes with new bill

#### Bill Details Modal
- Opens when clicking "View Details" on any bill
- Shows comprehensive bill information
- Same modal used in Billing Dashboard

## User Workflows

### Viewing Patients

1. **Navigate to Patients**
   - Click "Patients" in sidebar navigation
   - Patients directory loads with all patients

2. **Search for Patient**
   - Use search bar at top
   - Type name, MR number, phone, or email
   - Results filter in real-time

3. **View Patient Profile**
   - Click on patient card or "View" button
   - Patient profile loads with all information

### Creating Bill from Patient Profile

1. **Open Patient Profile**
   - Navigate to Patients section
   - Select desired patient

2. **Click Add Bill**
   - Button located at top-right of profile
   - AddBillModal opens

3. **Fill Bill Details**
   - Patient MR number already filled
   - Optionally select appointment
   - Enter service details
   - Set pricing and payment info

4. **Submit Bill**
   - Click "Create Bill"
   - Success message appears
   - Profile refreshes automatically
   - New bill appears in Billing History tab

### Viewing Bill Details

1. **Navigate to Billing History Tab**
   - In patient profile
   - Click "Billing History" tab

2. **Select Bill**
   - Click "View Details" on any bill
   - Bill details modal opens

3. **Review Information**
   - See complete bill breakdown
   - Check payment status
   - View all charges and discounts

## Data Flow

### Patient Data Aggregation
```javascript
// Fetches appointments
// Groups by patient_id
// Extracts patient info from first appointment
// Parses mobile_booking_data if available
// Counts total appointments per patient
// Identifies most recent visit
```

### Patient Profile Data
```javascript
// Fetches all appointments for patient
// Fetches all bills for patient
// Calculates statistics:
//   - Total visits
//   - Total billed amount
//   - Total paid amount
//   - Balance due
```

### Bill Creation Flow
```javascript
// Patient ID pre-filled from profile
// User fills bill details
// Bill created in opbilling table
// Profile refreshes
// New bill appears in history
```

## UI/UX Design

### Patients List
- **Grid Layout**: 3 columns on desktop, responsive
- **Card Design**: Gradient hover effects
- **Search Bar**: Prominent, easy to use
- **Visual Hierarchy**: Clear information structure

### Patient Profile
- **Header**: Gradient background with white text
- **Stats Cards**: Color-coded, clear metrics
- **Tabs**: Active state with gradient
- **Empty States**: Helpful messages and CTAs

### Color Coding
- **Blue**: Appointments and visits
- **Green**: Payments and completed items
- **Red**: Outstanding balances
- **Yellow**: Pending items

## Technical Implementation

### State Management
```javascript
// PatientsList
const [patients, setPatients] = useState([])
const [selectedPatient, setSelectedPatient] = useState(null)
const [searchQuery, setSearchQuery] = useState('')

// PatientProfile
const [patient, setPatient] = useState(null)
const [appointments, setAppointments] = useState([])
const [bills, setBills] = useState([])
const [activeTab, setActiveTab] = useState('overview')
const [showAddBillModal, setShowAddBillModal] = useState(false)
```

### Key Functions

**fetchPatients()**
- Queries appointments table
- Groups by patient_id
- Extracts unique patients
- Counts appointments per patient

**fetchPatientData()**
- Fetches patient appointments
- Fetches patient bills
- Calculates statistics
- Parses booking data

**getTotalBilled()**
- Sums all bill amounts
- Returns total billed

**getTotalPaid()**
- Sums all paid amounts
- Returns total paid

**getTotalDue()**
- Sums all balance due amounts
- Returns total outstanding

## Database Integration

### Tables Used
1. **appointments**: Patient information and visit history
2. **opbilling**: Billing records

### Queries
```javascript
// Get all appointments for patient list
.from('appointments')
.select('*')
.order('date', { ascending: false })

// Get patient appointments
.from('appointments')
.select('*')
.eq('patient_id', patientId)
.order('date', { ascending: false })

// Get patient bills
.from('opbilling')
.select('*')
.eq('patient_mrno', patientId)
.order('created_at', { ascending: false })
```

## Navigation Integration

### Dashboard Sidebar
- New "Patients" tab added
- Icon: Users
- Position: Between Appointments and Billing
- Active state: Gradient background

### Breadcrumb Navigation
- Patients List → Patient Profile
- Back button in profile header
- Returns to patients list

## Responsive Design

### Mobile
- Single column grid
- Stacked cards
- Touch-friendly buttons
- Collapsible sections

### Tablet
- 2-column grid
- Optimized spacing
- Readable text sizes

### Desktop
- 3-column grid
- Full information display
- Hover effects
- Optimal layout

## Performance Considerations

### Optimization
- Lazy loading of patient data
- Efficient data aggregation
- Minimal re-renders
- Cached patient information

### Loading States
- Spinner while fetching data
- Skeleton screens (future)
- Progressive loading

## Error Handling

### No Data States
- "No patients found" message
- "No appointments found" message
- "No bills found" with CTA
- Helpful guidance text

### Error Messages
- Database connection errors
- Data parsing errors
- Missing information handling

## Future Enhancements

### Potential Features
1. **Patient Registration**: Add new patients directly
2. **Edit Patient Info**: Update patient details
3. **Medical History**: Add medical records
4. **Prescriptions**: View prescription history
5. **Lab Results**: Integrate lab reports
6. **Imaging**: Link to radiology images
7. **Allergies**: Track patient allergies
8. **Insurance**: Manage insurance information
9. **Family History**: Record family medical history
10. **Export Data**: Download patient records

### Advanced Features
- **Patient Portal**: Patient self-service
- **Appointment Booking**: Schedule from profile
- **Communication**: SMS/Email notifications
- **Analytics**: Patient insights and trends
- **Reminders**: Follow-up reminders
- **Documents**: Upload/view documents
- **Consent Forms**: Digital consent management
- **Referrals**: Track referrals
- **Care Plans**: Create treatment plans
- **Vitals Tracking**: Record vital signs

## Security & Privacy

### Data Protection
- Row Level Security (RLS) in Supabase
- Access control by user role
- Audit logging
- HIPAA compliance considerations

### Best Practices
- Minimal data exposure
- Secure data transmission
- Encrypted storage
- Regular backups

## Testing Checklist

- ✅ Patients list loads correctly
- ✅ Search functionality works
- ✅ Patient cards display all info
- ✅ Profile loads with correct data
- ✅ Statistics calculate correctly
- ✅ Tabs switch properly
- ✅ Add Bill button works
- ✅ Bill modal pre-fills patient ID
- ✅ Bill creation updates profile
- ✅ Bill details modal opens
- ✅ Back navigation works
- ✅ Responsive on all devices
- ✅ Loading states display
- ✅ Empty states show correctly

## Usage Statistics

### Key Metrics to Track
- Number of patients viewed
- Most viewed patients
- Bills created from profiles
- Search usage
- Tab usage distribution
- Time spent on profiles

## Support & Troubleshooting

### Common Issues

**Patients not loading**
- Check appointments table has data
- Verify database permissions
- Check console for errors

**Patient info incomplete**
- Verify appointment data structure
- Check mobile_booking_data parsing
- Review data entry process

**Bills not appearing**
- Verify patient_mrno matches
- Check opbilling table
- Review RLS policies

**Add Bill not working**
- Check Supabase connection
- Verify form validation
- Review error messages

## Version History

### v1.0.0 (Current)
- Initial implementation
- Patients list with search
- Patient profile with tabs
- Integrated billing
- Statistics dashboard
- Responsive design

---

**Components**: PatientsList.jsx, PatientProfile.jsx  
**Integration**: Dashboard.jsx, AddBillModal.jsx  
**Database**: appointments, opbilling tables  
**Last Updated**: November 2025
