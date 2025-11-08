# Cura Hospitals - Doctor Portal

A modern, professional doctor portal for Cura Hospitals Bengaluru.

## Features

- 🔐 Secure login with Doctor ID and Password
- 🗄️ Supabase database integration
- ✅ Real-time authentication with error handling
- 🎨 Modern, responsive UI with TailwindCSS
- 💫 Smooth animations and transitions
- 📱 Mobile-friendly design
- 🏥 Professional healthcare-themed interface
- 🔔 Success and error notifications
- 📅 Appointment management and tracking
- 📋 Medical form creation and viewing
- 💰 **Billing Management System** (NEW)
  - View all patient bills with detailed information
  - Track payment status (Paid, Pending, Overdue)
  - Search and filter bills by multiple criteria
  - Comprehensive bill details with breakdown
  - Real-time statistics dashboard

## Getting Started

### Installation

```bash
npm install
```

### Environment Setup

1. Create a `.env` file in the root directory (already created)
2. The file contains your Supabase credentials:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Database Setup

**Important**: You need to set up your Supabase database before using the login.

See `DATABASE_SETUP.md` for detailed instructions on:
- Creating the `doctors` table
- Setting up authentication users
- Sample data and testing

### Development

```bash
npm run dev
```

The application will start at `http://localhost:3000` or `http://localhost:3001`

### Build

```bash
npm run build
```

## Tech Stack

- **React 18** - UI Framework
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Lucide React** - Icons
- **Supabase** - Backend & Authentication
- **@supabase/supabase-js** - Supabase client library

## Project Structure

```
cura-doctor-portal/
├── src/
│   ├── components/
│   │   ├── LoginPage.jsx
│   │   ├── Dashboard.jsx
│   │   ├── BillingDashboard.jsx (NEW)
│   │   ├── BillDetailsModal.jsx (NEW)
│   │   ├── FormSelector.jsx
│   │   ├── FormViewer.jsx
│   │   └── MedicalFormCanvas.jsx
│   ├── lib/
│   │   └── supabaseClient.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── DATABASE_SETUP.md
├── BILLING_FEATURE.md (NEW)
└── vite.config.js
```

## Documentation

- **`DATABASE_SETUP.md`** - Database schema and setup instructions
- **`BILLING_FEATURE.md`** - Comprehensive billing feature documentation
- **`MEDICAL_FORMS_SETUP.md`** - Medical forms configuration
- **`APPOINTMENTS_INTEGRATION.md`** - Appointment system integration

## Future Enhancements

- ✅ Dashboard for doctors (Completed)
- ✅ Appointment management (Completed)
- ✅ Medical records/forms (Completed)
- ✅ Billing management (Completed)
- 🔄 Patient management portal
- 🔄 Prescription management
- 🔄 Payment processing integration
- 🔄 Analytics and reporting
- 🔄 Mobile app integration
