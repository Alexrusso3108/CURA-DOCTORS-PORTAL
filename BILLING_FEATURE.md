# Billing Management Feature

## Overview
A comprehensive billing management system integrated into the Cura Hospitals Doctor Portal, allowing doctors and staff to view, track, and manage patient billing information from the `opbilling` table.

## Features Implemented

### 1. **Billing Dashboard** (`BillingDashboard.jsx`)
A complete billing overview with the following capabilities:

#### Statistics Cards
- **Total Bills**: Count of all bills in the system
- **Paid Amount**: Total amount received from paid bills
- **Pending Amount**: Total outstanding amount from pending bills
- **Overdue Amount**: Total amount from bills past their due date

#### Bill Listing
- Comprehensive table view of all bills with key information:
  - Bill Number
  - Patient MR Number
  - Service Name & Category
  - Bill Date
  - Total Amount
  - Paid Amount
  - Balance Due
  - Payment Status
  - Action buttons

#### Search & Filter
- **Search**: Search by bill number, patient ID, service name, or doctor name
- **Filter by Status**: Filter bills by payment status (All, Paid, Pending, Partially Paid, Cancelled)

#### Visual Indicators
- Color-coded status badges:
  - 🟢 **Green**: Paid
  - 🟡 **Yellow**: Pending
  - 🔵 **Blue**: Partially Paid
  - 🔴 **Red**: Cancelled
- Overdue bills highlighted with red background
- Status icons for quick visual identification

### 2. **Bill Details Modal** (`BillDetailsModal.jsx`)
Detailed view of individual bills with comprehensive information:

#### Information Sections

**Patient & Appointment Information**
- Patient MR Number
- Appointment ID

**Date Information**
- Bill Date
- Service Date
- Due Date

**Service Details**
- Service Name
- Service Category
- Billing Department
- Service Code (if available)
- Service Description (if available)

**Doctor Information** (if available)
- Doctor ID
- Doctor Name

**Billing Breakdown**
- Unit Price
- Quantity
- Subtotal
- Discount (percentage and amount)
- Tax (percentage and amount)
- **Total Amount** (highlighted)

**Payment Information**
- Paid Amount
- Balance Due
- Payment Method
- Transaction ID
- Paid Date/Time

**Staff Information**
- Created By (staff name)
- Created At (timestamp)

**Notes**
- Public notes
- Internal notes

**Cancellation Information** (if cancelled)
- Cancellation reason
- Cancelled at timestamp

#### Actions
- 🖨️ **Print**: Print bill details
- 📥 **Download**: Download bill as PDF (placeholder for future implementation)
- ❌ **Close**: Close the modal

### 3. **Dashboard Integration**
- New "Billing" tab added to the main dashboard navigation
- Seamless integration with existing dashboard features
- Accessible via the sidebar menu with a dollar sign icon ($)

## Database Schema (opbilling table)

The feature uses the following columns from the `opbilling` table:

```
- opbill_id (primary key)
- bill_number
- patient_mrno
- appointment_id
- service_category
- service_name
- service_code
- service_description
- billing_department
- doctor_id
- doctor_name
- created_by_staff_id
- created_by_staff_name
- unit_price
- quantity
- discount_percent
- tax_percent
- subtotal
- discount_amount
- tax_amount
- total_amount
- paid_amount
- balance_due
- payment_status (paid, pending, partially_paid, cancelled)
- payment_method
- payment_transaction_id
- billing_transaction_id
- due_date
- paid_date
- bill_status (active, cancelled)
- cancellation_reason
- cancelled_by_staff_id
- cancelled_at
- mobile_notification_sent
- mobile_payment_link
- notes
- internal_notes
- metadata
- bill_date
- service_date
- created_at
- updated_at
```

## Usage

### Accessing the Billing Dashboard
1. Log in to the doctor portal
2. Click on the "Billing" tab in the sidebar navigation
3. The billing dashboard will display with statistics and bill listing

### Viewing Bill Details
1. In the billing dashboard, locate the bill you want to view
2. Click the "View" button in the Actions column
3. A detailed modal will open showing all bill information
4. Use Print or Download buttons for documentation
5. Click "Close" to return to the dashboard

### Searching for Bills
1. Use the search bar at the top of the billing dashboard
2. Enter any of the following:
   - Bill number (e.g., "OPB-2025-11-04-00001")
   - Patient MR Number
   - Service name
   - Doctor name
3. Results will filter in real-time

### Filtering by Status
1. Use the status dropdown filter
2. Select desired status: All, Paid, Pending, Partially Paid, or Cancelled
3. The table will update to show only bills with the selected status

## Technical Implementation

### Components Structure
```
src/
├── components/
│   ├── Dashboard.jsx (updated with billing integration)
│   ├── BillingDashboard.jsx (main billing component)
│   └── BillDetailsModal.jsx (bill details modal)
```

### Key Technologies
- **React**: Component-based UI
- **Supabase**: Database queries and real-time data
- **Lucide React**: Icons
- **TailwindCSS**: Styling and responsive design

### Data Flow
1. `BillingDashboard` fetches all bills from Supabase on mount
2. Calculates statistics from fetched data
3. Applies search and filter logic client-side
4. Passes selected bill to `BillDetailsModal` when "View" is clicked
5. Modal displays comprehensive bill information

## Future Enhancements

### Potential Features
1. **Payment Processing**: Allow staff to record payments directly
2. **PDF Generation**: Actual PDF download functionality
3. **Email Integration**: Send bills to patients via email
4. **Payment Reminders**: Automated reminders for overdue bills
5. **Bulk Operations**: Select multiple bills for batch actions
6. **Advanced Filters**: Filter by date range, amount range, department
7. **Export to Excel**: Export billing data for reporting
8. **Payment History**: Track all payment transactions for a bill
9. **Refund Management**: Process and track refunds
10. **Analytics Dashboard**: Revenue trends, payment patterns, etc.

### Security Considerations
- Implement Row Level Security (RLS) policies in Supabase
- Restrict access based on user roles (doctor, admin, billing staff)
- Audit trail for all billing operations
- Secure payment transaction handling

## Testing

### Manual Testing Checklist
- ✅ Dashboard loads with correct statistics
- ✅ Bills display in table format
- ✅ Search functionality works correctly
- ✅ Status filter works correctly
- ✅ Overdue bills are highlighted
- ✅ Bill details modal opens with correct data
- ✅ All bill information displays properly
- ✅ Modal close button works
- ✅ Responsive design on mobile devices

### Sample Test Data
The system currently has 5 sample bills in the database:
- Mix of paid and pending bills
- Various service categories (consultation)
- Different payment methods (online, pending)
- Bills with and without doctor information

## Support

For issues or questions about the billing feature:
1. Check the console for error messages
2. Verify Supabase connection and permissions
3. Ensure the `opbilling` table exists and has proper RLS policies
4. Review the component code for any customization needs

## Version History

### v1.0.0 (Current)
- Initial implementation of billing dashboard
- Bill details modal
- Search and filter functionality
- Statistics cards
- Integration with main dashboard
