# 🩸 HEMORA — Advanced Blood Bank Management System

> **Every Drop Counts. Every Life Matters.**

HEMORA is a full-stack, production-grade Blood Bank Management System built with React + Vite (frontend) and Python Flask (backend). It features three distinct experiences: a public website, an Admin Portal, and a Donor Portal — all powered by a secure REST API with JWT authentication and MySQL database.

---

## Features

### Public Website
- Beautiful landing page with blood donation awareness content
- Blood group information and eligibility guidelines
- Real-time blood availability lookup
- Donor registration and login

### Authentication
- Secure JWT-based authentication (access + refresh tokens)
- Role-based access control (ADMIN / DONOR)
- Password hashing with bcrypt
- Protected routes on both frontend and backend
- Token auto-refresh

### Admin Portal
- Dashboard: Real-time stats, charts, alerts, recent activity
- Donor Management: View, search, filter, activate/deactivate donors
- Blood Inventory: Manage all 8 blood groups, track units, alerts
- Blood Requests: Approve/reject/fulfill requests, inventory deduction
- Donation Management: Record and verify donations
- Appointments: Approve/reject/complete/miss appointments
- Blood Camps: Create, publish, manage camps and registrations
- Notifications: Send to all, by blood group, or individual donors
- Certificates: Generate and download PDF donation certificates
- Reports & Analytics: CSV/PDF exports, date-range reports, charts

### Donor Portal
- Dashboard: Personalized welcome, eligibility status, upcoming appointments
- Profile: View and edit personal information
- Find Blood: Search blood availability by group and location
- Request Blood: Submit blood requests with urgency levels
- Book Appointment: Schedule donation appointments
- My Appointments: Track all appointments and their statuses
- Donation History: View all past donations
- Eligibility: Check eligibility status and next eligible date
- Blood Camps: Browse and register for blood donation camps
- Notifications: View and manage notifications
- My Certificates: Download PDF donation certificates

---

## Technology Stack

### Frontend
- React 18 + Vite
- Tailwind CSS
- React Router DOM v6
- Axios
- Recharts (Charts)
- Lucide React (Icons)
- React Hook Form + Yup
- React Hot Toast

### Backend
- Python 3.12 + Flask
- Flask-SQLAlchemy
- Flask-JWT-Extended
- Flask-Migrate
- Flask-CORS
- Flask-Bcrypt
- PyMySQL (MySQL connector)
- ReportLab (PDF generation)
- marshmallow
- pytest

### Database
- MySQL (via XAMPP/WAMP for development)
- SQLite (automatic fallback)

---

## Default Credentials

| Role  | Email              | Password  |
|-------|--------------------|-----------|
| Admin | admin@hemora.com   | Admin@123 |
| Donor | donor1@example.com | Donor@123 |

> Change these immediately in production!

---

## Setup Instructions

### Backend
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
# Edit .env with your MySQL password
flask --app run db init
flask --app run db migrate -m "Initial migration"
flask --app run db upgrade
python seed.py
python run.py
```

Backend runs at: http://localhost:5000

### Frontend
```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Frontend runs at: http://localhost:5173

### Running Tests
```powershell
cd backend
.\venv\Scripts\Activate.ps1
pytest tests/ -v
```

---

*Built with love for saving lives. Every drop counts.*
