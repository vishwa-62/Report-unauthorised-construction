# CityGuard AI 🏙️
> **Smart City Unauthorized Construction Monitoring & Citizen Reporting Platform**

CityGuard AI is an integrated smart city platform designed to detect, report, and manage unauthorized urban construction activities. Combining AI-assisted image analysis, geographic mapping, role-based governance workflows, and automated report generation, CityGuard AI empowers citizens, field inspectors, municipal engineers, and administrators to maintain urban compliance seamlessly.

---

## 🚀 Features

### 👤 Citizen Portal
- **Report Violations**: Submit unauthorized construction complaints with geo-location, category, description, and photo evidence.
- **AI Pre-Analysis**: Automatic preliminary severity scoring and detection tags for submitted evidence.
- **Live Complaint Tracking**: Real-time status updates from submission to resolution.
- **Interactive Map**: View reported construction incidents across the city.

### 👷 Officer & Engineer Dashboard
- **Field Inspections**: Assign and update field inspection tasks with status reports.
- **Notice Generation**: Draft, issue, and manage legal stop-work / demolition notices.
- **Spatial Mapping**: Map-based visualization of high-density violation clusters.

### 🛡️ Admin & Analytics Suite
- **Role-Based Access Control (RBAC)**: Fine-grained permissions for Citizens, Officers, Engineers, and Admins.
- **Analytics & Metrics**: Visual charts detailing violation trends, resolution rates, and zone hotspots.
- **Automated Reporting**: Export comprehensive PDF summary reports and Excel spreadsheets.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS, Framer Motion
- **Maps & Data Visualization**: Leaflet, React-Leaflet, Chart.js, React-Chartjs-2
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js & Express.js
- **Database**: SQLite (Development) / PostgreSQL (Production ready)
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs
- **File Processing**: Multer, PDFKit, ExcelJS
- **Security & Utilities**: Helmet, Compression, Express Rate Limit, Morgan

---

## 📂 Project Structure

```
.
├── backend/                # Node.js Express REST API server
│   ├── config/             # Database connection & environment configuration
│   ├── controllers/        # Business logic for auth, complaints, admin, analytics
│   ├── middleware/         # Auth verification & file upload middlewares
│   ├── routes/             # Express API routes
│   ├── utils/              # PDF/Excel generators, logger, AI analysis mock
│   └── server.js           # Express app entry point
├── frontend/               # React Vite SPA
│   ├── public/             # Static assets & icons
│   ├── src/
│   │   ├── components/     # UI Components (Map, Layouts, Cards)
│   │   ├── context/        # Authentication & State Management
│   │   ├── pages/          # Citizen, Officer, Engineer, Admin Views
│   │   └── App.jsx         # Application routing & layout
│   ├── index.html
│   └── vite.config.js
├── database/               # Database SQL files
│   ├── schema.sql          # Table definitions & constraints
│   └── seed.sql            # Seed data for initial setup
└── docs/                   # Detailed documentation
    ├── API.md              # REST API endpoint documentation
    ├── Architecture.md     # System architecture overview
    ├── Database.md         # Data schema details
    └── Deployment.md       # Production deployment guidelines
```

---

## 🚦 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- `npm` or `yarn`

### 1. Clone the Repository
```bash
git clone https://github.com/vishwa-62/Report-unauthorised-construction.git
cd Report-unauthorised-construction
```

### 2. Set Up & Start Backend
```bash
cd backend
npm install
npm start
```
> The backend server will run at `http://localhost:5000`. SQLite database (`cityguard.db`) will automatically initialize if not already present.

### 3. Set Up & Start Frontend
```bash
# In a new terminal window:
cd frontend
npm install
npm run dev
```
> The web application will be accessible at `http://localhost:5173`.

---

## 📄 Documentation

For in-depth details on system architecture, database schema, and API endpoints, check out the [`docs/`](./docs) folder:
- [API Documentation](./docs/API.md)
- [System Architecture](./docs/Architecture.md)
- [Database Specification](./docs/Database.md)
- [Deployment Guide](./docs/Deployment.md)

---

## 📜 License

This project is licensed under the [ISC License](LICENSE).
