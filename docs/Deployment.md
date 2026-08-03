# CityGuard AI - Deployment Guide

This guide details steps for local execution and production deployment of the CityGuard AI platform.

---

## 1. Local Setup

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **NPM**: v9.0.0 or higher
* **PostgreSQL (Optional)**: If PostgreSQL is not installed/running, the backend automatically spins up a local SQLite database (`cityguard.db`) inside the `backend/` folder on first launch.

### Step 1: Clone and Set Up Database (Optional)
If utilizing PostgreSQL:
1. Create a database named `cityguard`.
2. Execute the schema script: `psql -d cityguard -f database/schema.sql`
3. Execute the seed script: `psql -d cityguard -f database/seed.sql`

### Step 2: Configure Backend Environment
1. Navigate to the `backend/` folder.
2. Create or modify `.env` (a template is pre-created):
   ```env
   PORT=5000
   JWT_SECRET=supersecret_cityguard_token_key_123
   PGHOST=localhost
   PGPORT=5432
   PGUSER=postgres
   PGPASSWORD=your_postgres_password
   PGDATABASE=cityguard
   USE_SQLITE_FALLBACK=true
   ```
3. Run `npm install` (pre-completed in workspace).
4. Start the server:
   ```bash
   npm start
   ```

### Step 3: Configure Frontend Environment
1. Navigate to the `frontend/` folder.
2. Run `npm install` (pre-completed in workspace).
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the web interface at the printed URL (typically `http://localhost:5173`).

---

## 2. Production Deployments

### Database Layer
* **Host**: Managed databases on AWS RDS, Supabase, or Render PostgreSQL.
* Set production environment parameters `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` and change `USE_SQLITE_FALLBACK=false` to enforce strict PostgreSQL connections.

### Backend Hosting (Render, Railway, AWS EC2)
* Deploy the `backend/` directory.
* Set the start command to `npm start`.
* Set backend configurations in the hosting provider dashboard.
* **Persistent Disk**: If not utilizing AWS S3 or Cloudinary for uploads, attach a persistent storage disk to the backend service mapped to the `/backend/uploads` directory to prevent file deletions on restart.

### Frontend Hosting (Vercel, Netlify)
* Deploy the `frontend/` directory.
* Build command: `npm run build`
* Publish directory: `dist/`
* Set API proxy configurations if necessary, or let Axios call the absolute backend URL.
