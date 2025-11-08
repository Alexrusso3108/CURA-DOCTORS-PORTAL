# Billing Feature - Quick Start Guide

## 🚀 Getting Started

### Access the Billing Dashboard
1. **Login** to the Cura Doctor Portal
2. Click the **"Billing"** tab in the left sidebar (💰 icon)
3. The billing dashboard will load with all bills and statistics

## 📊 Dashboard Overview

### Statistics Cards (Top Row)
- **Total Bills**: Total number of bills in the system
- **Paid Amount**: Sum of all paid bills (₹)
- **Pending Amount**: Sum of all pending bills (₹)
- **Overdue Amount**: Sum of overdue bills (₹)

### Bills Table
Displays all bills with the following columns:
- Bill Number
- Patient ID
- Service Name & Category
- Bill Date
- Total Amount
- Paid Amount
- Balance Due
- Payment Status (with color coding)
- Actions (View button)

## 🔍 Search & Filter

### Search Bills
Use the search bar to find bills by:
- Bill number (e.g., `OPB-2025-11-04-00001`)
- Patient MR Number
- Service name
- Doctor name

### Filter by Status
Use the dropdown to filter by:
- **All Status** - Show all bills
- **Paid** - Only paid bills
- **Pending** - Only pending bills
- **Partially Paid** - Bills with partial payment
- **Cancelled** - Cancelled bills

## 👁️ View Bill Details

### Open Details
1. Find the bill in the table
2. Click the **"View"** button in the Actions column
3. A detailed modal will open

### Bill Details Modal Sections
- **Status Badge** - Current payment status
- **Patient Information** - Patient MR No, Appointment ID
- **Date Information** - Bill date, Service date, Due date
- **Service Details** - Service name, category, department, description
- **Doctor Information** - Doctor ID and name (if available)
- **Billing Breakdown** - Unit price, quantity, discounts, taxes, total
- **Payment Information** - Paid amount, balance, payment method, transaction ID
- **Staff Information** - Created by, timestamps
- **Notes** - Public and internal notes
- **Cancellation Info** - If bill is cancelled

### Actions in Details Modal
- 🖨️ **Print** - Print the bill
- 📥 **Download** - Download as PDF (coming soon)
- ❌ **Close** - Close the modal

## 🎨 Visual Indicators

### Status Colors
- 🟢 **Green Badge** - Paid
- 🟡 **Yellow Badge** - Pending
- 🔵 **Blue Badge** - Partially Paid
- 🔴 **Red Badge** - Cancelled

### Overdue Bills
- Bills past their due date with pending status are highlighted with a **red background**
- An "Overdue" label appears below the status badge

## 💡 Tips & Tricks

### Quick Actions
- **Double-click** on a row to view details (future enhancement)
- Use **keyboard shortcuts** for faster navigation (future enhancement)

### Best Practices
1. **Regular Monitoring**: Check the billing dashboard daily for overdue bills
2. **Search First**: Use search to quickly find specific bills
3. **Status Filtering**: Filter by status to focus on pending or overdue bills
4. **Print Records**: Print bills for patient records or accounting

### Common Tasks

#### Find Overdue Bills
1. Look for rows with red background in the table
2. Or filter by "Pending" status and check due dates

#### Check Patient's Bill History
1. Search by patient MR number
2. View all bills for that patient
3. Click "View" to see detailed information

#### Verify Payment Status
1. Search for the bill number
2. Check the status badge color
3. View details to see payment transaction ID

## 🔧 Troubleshooting

### Bills Not Loading
- Check internet connection
- Verify Supabase connection
- Check browser console for errors

### Search Not Working
- Ensure you're typing correctly
- Try partial matches
- Clear search and try again

### Details Modal Not Opening
- Try clicking "View" again
- Refresh the page
- Check browser console for errors

## 📞 Support

For technical issues:
1. Check the browser console (F12)
2. Review `BILLING_FEATURE.md` for detailed documentation
3. Contact system administrator

## 🔐 Security Notes

- Only authorized users can access billing information
- All data is fetched securely from Supabase
- Payment transaction IDs are displayed for verification
- Sensitive information is protected by Row Level Security (RLS)

## 📈 Future Features (Coming Soon)

- ✨ Record new payments directly
- ✨ Send bills via email to patients
- ✨ Generate and download PDF bills
- ✨ Bulk operations on multiple bills
- ✨ Advanced filtering (date range, amount range)
- ✨ Export to Excel for reporting
- ✨ Payment history tracking
- ✨ Automated payment reminders

---

**Version**: 1.0.0  
**Last Updated**: November 2025  
**Component**: BillingDashboard.jsx, BillDetailsModal.jsx
