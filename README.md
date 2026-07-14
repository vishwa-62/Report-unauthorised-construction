# Aegis Construct | Online Municipal Construction Monitoring System

Aegis Construct is a full-stack municipal management dashboard built to monitor, detect, and audit unauthorized construction activities across the city. Using dynamic satellite imagery comparisons, interactive GIS mapping (Leaflet.js), real-time inspector reports, and robust database tracking (SQLite), the application enables urban planning authorities to maintain zoning compliance.

---

## 🚀 Quick Start

Ensure you have **Node.js** (v18+) installed on your machine.

### 1. Install Dependencies
Run the install script from the root directory to install all packages for both the frontend and backend in one command:
```bash
npm run install:all
```

### 2. Start the Application
Launch both the Express API and Vite React frontend concurrently:
```bash
npm start
```

- **Frontend Access**: `http://localhost:5173` (or the URL output in your terminal)
- **Backend Express Server**: Runs at `http://localhost:5000`

---

## 🛠️ Tech Stack & Key Integrations

1. **Frontend**: Vite + React + Vanilla CSS (Custom Slate Cyberpunk Dashboard UI)
   - **Interactive Maps**: Leaflet.js rendering geographic coordinates with custom styled HTML/SVG dynamic status pins (pulsing rings indicate high-confidence alerts).
   - **Data Visualization**: Chart.js (`react-chartjs-2`) mapping zoning distributions, case status percentages, and violation typologies.
   - **Satellite Evidence Slider**: Custom overlay comparison component comparing "Before" (greenfield) vs "After" (current construction activity) aerial images.
2. **Backend**: Node.js + Express API
   - **Endpoints**: Supports queries for constructions listing, site timeline logs, citizen reports, status command executions, and automated analytics summaries.
3. **Database**: SQLite
   - **Schema**: Houses schemas for `constructions`, `reports`, and `logs` tables.
   - **Robust Fallback**: Includes a zero-compile JSON database backup that automatically overrides SQLite on systems lacking C++ compiler configurations for native SQLite builds.

---

## 📂 Project Structure

```
unauthorized-construction-monitor/
├── backend/
│   ├── data/
│   │   ├── database.sqlite       # SQLite local database file (created on boot)
│   │   └── database.json         # Backup JSON database (created if SQLite fails)
│   ├── db.js                     # Core database interface & seed script
│   ├── server.js                 # Express server endpoints
│   └── package.json              # Node.js backend configuration
├── frontend/
│   ├── public/
│   │   └── images/               # High-resolution mock satellite comparison images
│   ├── src/
│   │   ├── components/
│   │   │   ├── Analytics.jsx     # Chart.js analytics dashboard panels
│   │   │   ├── ConstructionList.jsx # Database table with multi-filters and sorting
│   │   │   ├── DetailsModal.jsx  # Interactive evidence slider & timeline log profile
│   │   │   ├── Header.jsx        # Live portal indicator & alerts banner dropdown
│   │   │   ├── MapView.jsx       # GIS Leaflet map layer & marker plot controller
│   │   │   ├── ReportForm.jsx    # Coordinate-pinning report submission modal
│   │   │   └── ReportsList.jsx   # List of incoming citizen violation reports
│   │   ├── App.jsx               # Main state router
│   │   ├── index.css             # Base styles, glows, sliders, and dark mode filters
│   │   └── main.jsx              # React mounting script
│   ├── index.html                # Imports stylesheets, Leaflet CDN, & Google Fonts
│   ├── vite.config.js            # Vite configurations
│   └── package.json              # Frontend dependency configurations
├── package.json                  # Root monorepo concurrency runner script
└── README.md                     # Documentation
```

---

## 💻 Portal Workflows

### 1. Control Room Dashboard (`Control Map`)
- Inspect a city-wide map where construction sites are marked. Red rings indicate unpermitted construction or code violations.
- Click any marker to view a summary popup, then click **View Details** to open the site's profile.
- **Pin Reports**: Click anywhere on the map grid to auto-retrieve GPS coordinates and open a violation report form.

### 2. Evidence Comparison Slider
- Located inside the **Monitored Site Profile**.
- Drag the central bar handle left-to-right to review before/after satellite frames of the plot to audit height elevations or green-belt boundaries.

### 3. Municipal Inspector Control
- From the **Monitored Site Profile**, select administrative updates (e.g. *Post Stop Work Order*, *Schedule Forced Demolition*, *Approve Construction*), input logging notes, and submit.
- The updates instantly append to the site's **Registry Timeline** log.

### 4. Citizen Portal & Approvals
- Submit a new construction incident under the citizen form.
- View submissions in the **Citizen Reports** tab. Admins can click **Approve & Start Monitoring** to instantly pin the report as an active monitored location on the map.
