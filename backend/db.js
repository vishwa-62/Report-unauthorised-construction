import fs from 'fs';
import path from 'url';
import { fileURLToPath } from 'url';
import fsExtra from 'fs'; // Just use standard fs
import pathNode from 'path';

const __dirname = pathNode.dirname(fileURLToPath(import.meta.url));
const DB_DIR = pathNode.join(__dirname, 'data');
const SQLITE_FILE = pathNode.join(DB_DIR, 'database.sqlite');
const JSON_FILE = pathNode.join(DB_DIR, 'database.json');

// Ensure database directory exists
if (!fsExtra.existsSync(DB_DIR)) {
  fsExtra.mkdirSync(DB_DIR, { recursive: true });
}

let dbMode = 'json'; // 'sqlite' or 'json'
let sqliteDb = null;
let jsonData = null;

// Initial mock data
const initialConstructions = [
  {
    id: 1,
    address: "2450 Vallejo St, Pacific Heights, San Francisco, CA",
    latitude: 37.7952,
    longitude: -122.4385,
    permit_number: "PRM-2025-0891",
    zoning_type: "Residential-R1",
    status: "Authorized",
    violation_type: "None",
    ai_confidence: 12.4,
    image_before: "/images/site1_before.jpg",
    image_after: "/images/site1_after.jpg",
    created_at: "2026-05-10T08:00:00Z"
  },
  {
    id: 2,
    address: "812 Broadway, Chinatown, San Francisco, CA",
    latitude: 37.7981,
    longitude: -122.4086,
    permit_number: "N/A - No Record",
    zoning_type: "Commercial-C2",
    status: "Violation Confirmed",
    violation_type: "No Permit",
    ai_confidence: 94.6,
    image_before: "/images/site2_before.jpg",
    image_after: "/images/site2_after.jpg",
    created_at: "2026-06-01T14:30:00Z"
  },
  {
    id: 3,
    address: "350 Mission St, SoMa, San Francisco, CA",
    latitude: 37.7901,
    longitude: -122.3972,
    permit_number: "PRM-2026-0112",
    zoning_type: "Commercial-C3",
    status: "Under Review",
    violation_type: "Zoning Deviation",
    ai_confidence: 76.2,
    image_before: "/images/site3_before.jpg",
    image_after: "/images/site3_after.jpg",
    created_at: "2026-06-15T11:15:00Z"
  },
  {
    id: 4,
    address: "Golden Gate Park Belt, Overlook Dr, San Francisco, CA",
    latitude: 37.7685,
    longitude: -122.4748,
    permit_number: "N/A - Protected Land",
    zoning_type: "Green Belt / Public Park",
    status: "Demolition Scheduled",
    violation_type: "Green Belt Encroachment",
    ai_confidence: 98.9,
    image_before: "/images/site4_before.jpg",
    image_after: "/images/site4_after.jpg",
    created_at: "2026-07-02T09:45:00Z"
  },
  {
    id: 5,
    address: "1420 45th Ave, Sunset District, San Francisco, CA",
    latitude: 37.7602,
    longitude: -122.5042,
    permit_number: "PRM-2025-1440",
    zoning_type: "Residential-R1",
    status: "Resolved",
    violation_type: "None",
    ai_confidence: 45.1,
    image_before: "/images/site5_before.jpg",
    image_after: "/images/site5_after.jpg",
    created_at: "2026-04-20T10:00:00Z"
  },
  {
    id: 6,
    address: "2600 Lake St, Presidio Heights, San Francisco, CA",
    latitude: 37.7869,
    longitude: -122.4862,
    permit_number: "PRM-2025-0711",
    zoning_type: "Residential-R2",
    status: "Stop Work Order",
    violation_type: "Extra Floor Encroachment",
    ai_confidence: 89.3,
    image_before: "/images/site6_before.jpg",
    image_after: "/images/site6_after.jpg",
    created_at: "2026-06-25T16:20:00Z"
  }
];

const initialLogs = [
  { id: 1, construction_id: 1, event_type: "permit_verified", description: "Permit PRM-2025-0891 validated for R1 residential structure. Construction matches blueprints.", user_role: "Inspector", created_at: "2026-05-12T10:00:00Z" },
  
  { id: 2, construction_id: 2, event_type: "detection", description: "Satellite imagery flagged new structural footprint. Area was previously vacant lot.", user_role: "System AI", created_at: "2026-06-01T14:30:00Z" },
  { id: 3, construction_id: 2, event_type: "inspector_dispatch", description: "Inspector dispatched to site to verify active construction.", user_role: "Admin", created_at: "2026-06-03T09:00:00Z" },
  { id: 4, construction_id: 2, event_type: "status_change", description: "Violation confirmed. Concrete framing erected without municipal permit records.", user_role: "Inspector", created_at: "2026-06-03T13:45:00Z" },

  { id: 5, construction_id: 3, event_type: "detection", description: "AI alert: Height change detected. Elevation exceeds permitted 3-story limit.", user_role: "System AI", created_at: "2026-06-15T11:15:00Z" },
  { id: 6, construction_id: 3, event_type: "status_change", description: "Case set to Under Review. Structural audit scheduled.", user_role: "Admin", created_at: "2026-06-16T15:00:00Z" },

  { id: 7, construction_id: 4, event_type: "detection", description: "AI alert: Encroachment in public park boundaries.", user_role: "System AI", created_at: "2026-07-02T09:45:00Z" },
  { id: 8, construction_id: 4, event_type: "legal_notice", description: "Demolition order served to unauthorized shed/fenced enclosure.", user_role: "Admin", created_at: "2026-07-05T10:30:00Z" },
  { id: 9, construction_id: 4, event_type: "status_change", description: "Demolition scheduled for 2026-07-20 by municipal enforcement.", user_role: "Admin", created_at: "2026-07-08T11:00:00Z" },

  { id: 10, construction_id: 5, event_type: "detection", description: "Citizen report: Backhouse construction suspected to be exceeding plot line.", user_role: "System AI", created_at: "2026-04-20T10:00:00Z" },
  { id: 11, construction_id: 5, event_type: "status_change", description: "Case resolved. Inspector verified extension fits code regulations and has valid permit.", user_role: "Inspector", created_at: "2026-04-25T14:00:00Z" },

  { id: 12, construction_id: 6, event_type: "detection", description: "AI Alert: Height scan shows 4th floor frame, but zoning permit PRM-2025-0711 allows 3 floors max.", user_role: "System AI", created_at: "2026-06-25T16:20:00Z" },
  { id: 13, construction_id: 6, event_type: "legal_notice", description: "Official Stop Work Order posted at construction site entry.", user_role: "Inspector", created_at: "2026-06-28T09:30:00Z" }
];

const initialReports = [
  {
    id: 1,
    address: "180 Guerrero St, Mission District, San Francisco, CA",
    latitude: 37.7645,
    longitude: -122.4241,
    description: "Digging foundation next door without any visible permit display. Heavy dust and noise starting at 6 AM.",
    reporter_name: "John Doe",
    reporter_contact: "john.doe@email.com",
    image_url: "/images/report1.jpg",
    status: "Pending",
    created_at: "2026-07-10T12:00:00Z"
  }
];

// Try initializing SQLite DB, fallback to JSON file database on failure
export async function initDb() {
  try {
    const sqlite3 = (await import('sqlite3')).default;
    const { open } = await import('sqlite');

    sqliteDb = await open({
      filename: SQLITE_FILE,
      driver: sqlite3.Database
    });

    // Create tables
    await sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS constructions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        address TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        permit_number TEXT,
        zoning_type TEXT,
        status TEXT NOT NULL,
        violation_type TEXT,
        ai_confidence REAL,
        image_before TEXT,
        image_after TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        construction_id INTEGER NOT NULL,
        event_type TEXT NOT NULL,
        description TEXT NOT NULL,
        user_role TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(construction_id) REFERENCES constructions(id)
      );

      CREATE TABLE IF NOT EXISTS reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        address TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        description TEXT,
        reporter_name TEXT,
        reporter_contact TEXT,
        image_url TEXT,
        status TEXT DEFAULT 'Pending',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Check if tables are empty, if so, seed them
    const count = await sqliteDb.get("SELECT COUNT(*) as count FROM constructions");
    if (count.count === 0) {
      for (const c of initialConstructions) {
        await sqliteDb.run(
          `INSERT INTO constructions (id, address, latitude, longitude, permit_number, zoning_type, status, violation_type, ai_confidence, image_before, image_after, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [c.id, c.address, c.latitude, c.longitude, c.permit_number, c.zoning_type, c.status, c.violation_type, c.ai_confidence, c.image_before, c.image_after, c.created_at]
        );
      }
      for (const l of initialLogs) {
        await sqliteDb.run(
          `INSERT INTO logs (id, construction_id, event_type, description, user_role, created_at)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [l.id, l.construction_id, l.event_type, l.description, l.user_role, l.created_at]
        );
      }
      for (const r of initialReports) {
        await sqliteDb.run(
          `INSERT INTO reports (id, address, latitude, longitude, description, reporter_name, reporter_contact, image_url, status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [r.id, r.address, r.latitude, r.longitude, r.description, r.reporter_name, r.reporter_contact, r.image_url, r.status, r.created_at]
        );
      }
      console.log("SQLite database seeded successfully.");
    }

    dbMode = 'sqlite';
    console.log("Database initialized in SQLite mode.");
  } catch (err) {
    console.warn("SQLite initialization failed, falling back to JSON storage mode. Error:", err.message);
    dbMode = 'json';
    
    // JSON Fallback logic
    if (!fsExtra.existsSync(JSON_FILE)) {
      jsonData = {
        constructions: [...initialConstructions],
        logs: [...initialLogs],
        reports: [...initialReports]
      };
      saveJsonData();
      console.log("JSON database seeded successfully.");
    } else {
      try {
        jsonData = JSON.parse(fsExtra.readFileSync(JSON_FILE, 'utf8'));
      } catch (jsonErr) {
        console.error("Failed to read JSON DB, resetting to defaults.", jsonErr);
        jsonData = {
          constructions: [...initialConstructions],
          logs: [...initialLogs],
          reports: [...initialReports]
        };
        saveJsonData();
      }
    }
    console.log("Database initialized in JSON file mode.");
  }
}

function saveJsonData() {
  if (dbMode === 'json' && jsonData) {
    fsExtra.writeFileSync(JSON_FILE, JSON.stringify(jsonData, null, 2), 'utf8');
  }
}

// API functions
export async function getConstructions() {
  if (dbMode === 'sqlite') {
    return await sqliteDb.all("SELECT * FROM constructions ORDER BY created_at DESC");
  } else {
    return [...jsonData.constructions].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
}

export async function getConstructionById(id) {
  const numericId = parseInt(id, 10);
  if (dbMode === 'sqlite') {
    const site = await sqliteDb.get("SELECT * FROM constructions WHERE id = ?", [numericId]);
    if (!site) return null;
    const logs = await sqliteDb.all("SELECT * FROM logs WHERE construction_id = ? ORDER BY created_at DESC", [numericId]);
    return { ...site, logs };
  } else {
    const site = jsonData.constructions.find(c => c.id === numericId);
    if (!site) return null;
    const logs = jsonData.logs.filter(l => l.construction_id === numericId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { ...site, logs };
  }
}

export async function createConstruction(data) {
  const newId = dbMode === 'sqlite' 
    ? null 
    : (jsonData.constructions.length > 0 ? Math.max(...jsonData.constructions.map(c => c.id)) + 1 : 1);
    
  const site = {
    address: data.address,
    latitude: parseFloat(data.latitude),
    longitude: parseFloat(data.longitude),
    permit_number: data.permit_number || 'N/A - No Record',
    zoning_type: data.zoning_type || 'Unspecified',
    status: data.status || 'Under Review',
    violation_type: data.violation_type || 'None',
    ai_confidence: parseFloat(data.ai_confidence || 0),
    image_before: data.image_before || '/images/site_default_before.jpg',
    image_after: data.image_after || '/images/site_default_after.jpg',
    created_at: new Date().toISOString()
  };

  if (dbMode === 'sqlite') {
    const result = await sqliteDb.run(
      `INSERT INTO constructions (address, latitude, longitude, permit_number, zoning_type, status, violation_type, ai_confidence, image_before, image_after, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [site.address, site.latitude, site.longitude, site.permit_number, site.zoning_type, site.status, site.violation_type, site.ai_confidence, site.image_before, site.image_after, site.created_at]
    );
    const id = result.lastID;
    
    // Add default log
    await sqliteDb.run(
      `INSERT INTO logs (construction_id, event_type, description, user_role)
       VALUES (?, ?, ?, ?)`,
      [id, 'detection', `Site registered at coordinates [${site.latitude}, ${site.longitude}]`, 'System AI']
    );
    
    return { id, ...site };
  } else {
    site.id = newId;
    jsonData.constructions.push(site);
    jsonData.logs.push({
      id: jsonData.logs.length > 0 ? Math.max(...jsonData.logs.map(l => l.id)) + 1 : 1,
      construction_id: newId,
      event_type: 'detection',
      description: `Site registered at coordinates [${site.latitude}, ${site.longitude}]`,
      user_role: 'System AI',
      created_at: new Date().toISOString()
    });
    saveJsonData();
    return site;
  }
}

export async function updateConstructionStatus(id, status, description, userRole = 'Admin') {
  const numericId = parseInt(id, 10);
  let violationType = 'None';
  if (status === 'Violation Confirmed') violationType = 'No Permit';
  if (status === 'Stop Work Order') violationType = 'Extra Floor Encroachment';
  if (status === 'Demolition Scheduled') violationType = 'Green Belt Encroachment';
  if (status === 'Resolved' || status === 'Authorized') violationType = 'None';

  if (dbMode === 'sqlite') {
    const site = await sqliteDb.get("SELECT * FROM constructions WHERE id = ?", [numericId]);
    if (!site) return null;
    
    // If resolving, we might reset violation type
    const query = violationType !== 'None' 
      ? `UPDATE constructions SET status = ?, violation_type = ? WHERE id = ?`
      : `UPDATE constructions SET status = ? WHERE id = ?`;
    
    const params = violationType !== 'None' ? [status, violationType, numericId] : [status, numericId];
    await sqliteDb.run(query, params);
    
    await sqliteDb.run(
      `INSERT INTO logs (construction_id, event_type, description, user_role)
       VALUES (?, 'status_change', ?, ?)`,
      [numericId, description || `Status updated to ${status}`, userRole]
    );

    return await getConstructionById(numericId);
  } else {
    const site = jsonData.constructions.find(c => c.id === numericId);
    if (!site) return null;
    
    site.status = status;
    if (violationType !== 'None' || status === 'Resolved' || status === 'Authorized') {
      site.violation_type = violationType;
    }
    
    jsonData.logs.push({
      id: jsonData.logs.length > 0 ? Math.max(...jsonData.logs.map(l => l.id)) + 1 : 1,
      construction_id: numericId,
      event_type: 'status_change',
      description: description || `Status updated to ${status}`,
      user_role: userRole,
      created_at: new Date().toISOString()
    });
    
    saveJsonData();
    return {
      ...site,
      logs: jsonData.logs.filter(l => l.construction_id === numericId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    };
  }
}

export async function getReports() {
  if (dbMode === 'sqlite') {
    return await sqliteDb.all("SELECT * FROM reports ORDER BY created_at DESC");
  } else {
    return [...jsonData.reports].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
}

export async function createReport(data) {
  const report = {
    address: data.address,
    latitude: parseFloat(data.latitude),
    longitude: parseFloat(data.longitude),
    description: data.description,
    reporter_name: data.reporter_name || 'Anonymous',
    reporter_contact: data.reporter_contact || 'N/A',
    image_url: data.image_url || '/images/report_default.jpg',
    status: 'Pending',
    created_at: new Date().toISOString()
  };

  if (dbMode === 'sqlite') {
    const result = await sqliteDb.run(
      `INSERT INTO reports (address, latitude, longitude, description, reporter_name, reporter_contact, image_url, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [report.address, report.latitude, report.longitude, report.description, report.reporter_name, report.reporter_contact, report.image_url, report.status, report.created_at]
    );
    return { id: result.lastID, ...report };
  } else {
    report.id = jsonData.reports.length > 0 ? Math.max(...jsonData.reports.map(r => r.id)) + 1 : 1;
    jsonData.reports.push(report);
    saveJsonData();
    return report;
  }
}

export async function approveReport(reportId) {
  const numericId = parseInt(reportId, 10);
  if (dbMode === 'sqlite') {
    const report = await sqliteDb.get("SELECT * FROM reports WHERE id = ?", [numericId]);
    if (!report) return null;
    await sqliteDb.run("UPDATE reports SET status = 'Approved' WHERE id = ?", [numericId]);
    
    // Create new construction record
    const site = await createConstruction({
      address: report.address,
      latitude: report.latitude,
      longitude: report.longitude,
      permit_number: 'N/A - Citizen Reported',
      zoning_type: 'Residential-R1',
      status: 'Under Review',
      violation_type: 'No Permit',
      ai_confidence: 85.0,
      image_before: '/images/report_default.jpg',
      image_after: '/images/report_default.jpg'
    });
    
    return site;
  } else {
    const report = jsonData.reports.find(r => r.id === numericId);
    if (!report) return null;
    report.status = 'Approved';
    
    const site = await createConstruction({
      address: report.address,
      latitude: report.latitude,
      longitude: report.longitude,
      permit_number: 'N/A - Citizen Reported',
      zoning_type: 'Residential-R1',
      status: 'Under Review',
      violation_type: 'No Permit',
      ai_confidence: 85.0,
      image_before: '/images/report_default.jpg',
      image_after: '/images/report_default.jpg'
    });
    
    saveJsonData();
    return site;
  }
}

export async function getAnalytics() {
  const constructions = await getConstructions();
  
  const total = constructions.length;
  const activeViolations = constructions.filter(c => ['Violation Confirmed', 'Stop Work Order', 'Demolition Scheduled'].includes(c.status)).length;
  const underReview = constructions.filter(c => c.status === 'Under Review').length;
  const resolved = constructions.filter(c => c.status === 'Resolved').length;
  const authorized = constructions.filter(c => c.status === 'Authorized').length;

  const zoningCounts = {};
  const violationCounts = {};
  const statusCounts = {};

  constractions.forEach(c => {
    zoningCounts[c.zoning_type] = (zoningCounts[c.zoning_type] || 0) + 1;
    if (c.status !== 'Authorized' && c.status !== 'Resolved') {
      violationCounts[c.violation_type] = (violationCounts[c.violation_type] || 0) + 1;
    }
    statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
  });

  return {
    summary: {
      total,
      activeViolations,
      underReview,
      resolved,
      authorized
    },
    zoningBreakdown: Object.keys(zoningCounts).map(key => ({ name: key, value: zoningCounts[key] })),
    violationBreakdown: Object.keys(violationCounts).map(key => ({ name: key, value: violationCounts[key] })),
    statusBreakdown: Object.keys(statusCounts).map(key => ({ name: key, value: statusCounts[key] }))
  };
}
