import express from 'express';
import cors from 'cors';
import {
  initDb,
  getConstructions,
  getConstructionById,
  createConstruction,
  updateConstructionStatus,
  getReports,
  createReport,
  approveReport,
  getAnalytics
} from './db.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Initialize database before starting server
await initDb();

// Endpoints
app.get('/api/constructions', async (req, res) => {
  try {
    const list = await getConstructions();
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch constructions" });
  }
});

app.get('/api/constructions/:id', async (req, res) => {
  try {
    const site = await getConstructionById(req.params.id);
    if (!site) {
      return res.status(404).json({ error: "Construction site not found" });
    }
    res.json(site);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch construction details" });
  }
});

app.post('/api/constructions', async (req, res) => {
  try {
    const { address, latitude, longitude } = req.body;
    if (!address || !latitude || !longitude) {
      return res.status(400).json({ error: "Address, latitude, and longitude are required" });
    }
    const newSite = await createConstruction(req.body);
    res.status(201).json(newSite);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create construction record" });
  }
});

app.put('/api/constructions/:id/status', async (req, res) => {
  try {
    const { status, description, userRole } = req.body;
    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }
    const updated = await updateConstructionStatus(req.params.id, status, description, userRole);
    if (!updated) {
      return res.status(404).json({ error: "Construction site not found" });
    }
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update status" });
  }
});

app.get('/api/reports', async (req, res) => {
  try {
    const reports = await getReports();
    res.json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

app.post('/api/reports', async (req, res) => {
  try {
    const { address, latitude, longitude, description } = req.body;
    if (!address || !latitude || !longitude || !description) {
      return res.status(400).json({ error: "Address, latitude, longitude, and description are required" });
    }
    const newReport = await createReport(req.body);
    res.status(201).json(newReport);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit report" });
  }
});

app.post('/api/reports/:id/approve', async (req, res) => {
  try {
    const site = await approveReport(req.params.id);
    if (!site) {
      return res.status(404).json({ error: "Report not found or failed to approve" });
    }
    res.json({ message: "Report approved and site registered for monitoring", site });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to approve report" });
  }
});

app.get('/api/analytics', async (req, res) => {
  try {
    const stats = await getAnalytics();
    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

// Start listening
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
