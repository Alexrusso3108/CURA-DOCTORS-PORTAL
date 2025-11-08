# Add Bill Feature Documentation

## Overview
New functionality added to the Billing Dashboard that allows users to create new bills directly from the doctor portal interface.

## Components

### 1. AddBillModal Component (`src/components/AddBillModal.jsx`)

A comprehensive modal form for creating new billing entries with the following features:

#### Form Sections

**Patient & Appointment Details**
- Appointment selection dropdown (optional)
- Patient MR Number (required)
- Auto-populates patient info when appointment is selected

**Service Details**
- Service Category (dropdown):
  - Consultation
  - Procedure
  - Laboratory
  - Radiology
  - Pharmacy
  - Other
- Service Name (required)
- Service Description (optional)
- Billing Department (dropdown):
  - OPD
  - IPD
  - Emergency
  - Laboratory
  - Radiology
  - Pharmacy

**Doctor Information** (Optional)
- Doctor ID
- Doctor Name

**Pricing Details**
- Unit Price (required)
- Quantity (default: 1)
- Discount Percentage (0-100%)
- Tax Percentage (0-100%)
- Real-time calculation display:
  - Subtotal
  - Discount Amount
  - Tax Amount
  - Total Amount

**Payment Details**
- Payment Status (dropdown):
  - Pending (default)
  - Paid
  - Partially Paid
- Due Date (defaults to 7 days from today)
- Notes (optional)

#### Features

**Auto-Calculations**
- Automatically calculates:
  - Subtotal = Unit Price × Quantity
  - Discount Amount = Subtotal × Discount %
  - Tax Amount = (Subtotal - Discount) × Tax %
  - Total Amount = Subtotal - Discount + Tax
- Updates in real-time as values change

**Bill Number Generation**
- Format: `OPB-YYYY-MM-DD-XXXXX`
- Example: `OPB-2025-11-08-00123`
- Automatically generated on submission

**Validation**
- Required fields marked with red asterisk (*)
- Form validation before submission
- Error messages displayed for issues
- Success message on successful creation

**Integration**
- Fetches recent appointments for easy selection
- Auto-populates patient and doctor info from selected appointment
- Inserts data into `opbilling` Supabase table
- Refreshes billing dashboard after creation

### 2. BillingDashboard Integration

**Add Bill Button**
- Prominent button at the top of the billing section
- Gradient styling matching the design system
- Opens AddBillModal on click

**Modal Management**
- State management for showing/hiding modal
- Callback to refresh bills after creation
- Clean close functionality

## Usage

### Creating a New Bill

1. **Navigate to Billing Section**
   - Click "Billing" in the sidebar navigation

2. **Open Add Bill Modal**
   - Click the "Add New Bill" button at the top

3. **Fill in Required Information**
   - Enter Patient MR Number (or select from appointments)
   - Enter Service Name
   - Enter Unit Price
   - Optionally fill other fields

4. **Review Calculations**
   - Check the auto-calculated amounts
   - Adjust discount/tax if needed

5. **Submit**
   - Click "Create Bill" button
   - Wait for success message
   - Modal closes automatically
   - Dashboard refreshes with new bill

### Optional: Using Appointment Selection

1. Select an appointment from the dropdown
2. Patient MR Number and Doctor ID auto-populate
3. Continue filling remaining fields

## Database Schema

### Fields Inserted into `opbilling` Table

```javascript
{
  bill_number: "OPB-2025-11-08-XXXXX",  // Auto-generated
  patient_mrno: "string",                // Required
  appointment_id: "uuid",                // Optional
  service_category: "string",            // Default: "consultation"
  service_name: "string",                // Required
  service_description: "string",         // Optional
  billing_department: "string",          // Default: "OPD"
  doctor_id: number,                     // Optional
  doctor_name: "string",                 // Optional
  created_by_staff_name: "Doctor Portal", // Auto-set
  unit_price: number,                    // Required
  quantity: number,                      // Default: 1
  discount_percent: number,              // Default: 0
  tax_percent: number,                   // Default: 0
  subtotal: number,                      // Calculated
  discount_amount: number,               // Calculated
  tax_amount: number,                    // Calculated
  total_amount: number,                  // Calculated
  paid_amount: 0,                        // Default
  balance_due: number,                   // = total_amount
  payment_status: "string",              // Default: "pending"
  payment_method: "string",              // Optional
  due_date: "date",                      // Default: +7 days
  bill_status: "active",                 // Auto-set
  bill_date: "date",                     // Today
  service_date: "date",                  // Today
  notes: "string"                        // Optional
}
```

## UI/UX Design

### Modal Design
- **Header**: Gradient background with icon and title
- **Form Sections**: Color-coded backgrounds for easy identification
  - Blue: Patient & Appointment
  - Purple: Service Details
  - Green: Doctor Information
  - Yellow: Pricing Details
  - Orange: Payment Details
- **Responsive**: Works on mobile and desktop
- **Accessibility**: Proper labels and focus states

### Button Styling
- Primary action: Gradient button with hover effects
- Secondary action: Gray button
- Loading state: Spinner with disabled state
- Success feedback: Green alert message

### Form Validation
- Required fields clearly marked
- Real-time calculation updates
- Error messages in red alerts
- Success messages in green alerts

## Technical Implementation

### State Management
```javascript
const [formData, setFormData] = useState({
  // All form fields with default values
})
const [loading, setLoading] = useState(false)
const [error, setError] = useState('')
const [success, setSuccess] = useState('')
```

### Key Functions

**handleInputChange**
- Updates form state on input change
- Triggers real-time calculations

**handleAppointmentSelect**
- Fetches appointment details
- Auto-populates related fields

**calculateAmounts**
- Performs all pricing calculations
- Returns formatted amounts

**generateBillNumber**
- Creates unique bill number
- Uses date and random number

**handleSubmit**
- Validates form data
- Inserts into database
- Shows success/error messages
- Refreshes parent component

## Error Handling

### Validation Errors
- Missing required fields
- Invalid number formats
- Out-of-range percentages

### Database Errors
- Connection issues
- Insert failures
- Permission errors

### User Feedback
- Clear error messages
- Success confirmation
- Loading indicators

## Future Enhancements

### Potential Improvements
1. **Patient Search**: Search patients by name/ID
2. **Service Templates**: Pre-defined service packages
3. **Bulk Billing**: Create multiple bills at once
4. **Payment Recording**: Record payments directly
5. **Bill Editing**: Edit existing bills
6. **Print Preview**: Preview before creation
7. **Email Notification**: Send bill to patient
8. **Barcode/QR**: Generate scannable codes
9. **Insurance Integration**: Add insurance details
10. **Recurring Bills**: Set up recurring billing

### Advanced Features
- **Multi-currency support**
- **Tax calculation by region**
- **Discount rules engine**
- **Payment plans**
- **Refund processing**
- **Bill cancellation**
- **Audit trail**
- **Analytics integration**

## Testing Checklist

- ✅ Form opens correctly
- ✅ All fields accept input
- ✅ Calculations work correctly
- ✅ Appointment selection populates fields
- ✅ Validation prevents invalid submissions
- ✅ Bill is created in database
- ✅ Dashboard refreshes after creation
- ✅ Error messages display properly
- ✅ Success message appears
- ✅ Modal closes after success
- ✅ Responsive on mobile
- ✅ Keyboard navigation works

## Security Considerations

### Data Validation
- Server-side validation required
- Sanitize all inputs
- Validate number ranges
- Check user permissions

### Access Control
- Verify user has billing permissions
- Log all bill creation actions
- Implement Row Level Security (RLS)

### Audit Trail
- Track who created each bill
- Record creation timestamp
- Log any modifications

## Support & Troubleshooting

### Common Issues

**Bill not appearing after creation**
- Check browser console for errors
- Verify Supabase connection
- Check RLS policies

**Calculations incorrect**
- Verify input values are numbers
- Check discount/tax percentages
- Review calculation logic

**Appointment dropdown empty**
- Verify appointments table has data
- Check database permissions
- Review query filters

### Debug Mode
Enable console logging to see:
- Form data before submission
- API responses
- Error details

## Version History

### v1.0.0 (Current)
- Initial implementation
- Basic bill creation
- Auto-calculations
- Appointment integration
- Real-time validation

---

**Component**: AddBillModal.jsx  
**Integration**: BillingDashboard.jsx  
**Database**: opbilling table  
**Last Updated**: November 2025
