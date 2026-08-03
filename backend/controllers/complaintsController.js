const db = require('../config/db');
const { analyzeImage } = require('../utils/aiMock');
const logger = require('../utils/logger');

// Generate unique complaint number (e.g. CG-2026-0428)
async function generateComplaintNumber() {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `CG-${year}-${rand}`;
}

// 1. Create a new complaint
async function createComplaint(req, res) {
  const { description, address, latitude, longitude, ward_id, category_id, custom_category, nearby_landmark } = req.body;
  const citizenId = req.user.id;

  if (!description || !address || !latitude || !longitude || !ward_id) {
    return res.status(400).json({ message: 'Missing required fields: description, address, coordinates, and ward.' });
  }

  try {
    const compNum = await generateComplaintNumber();
    
    // Determine severity from category (or default to medium)
    let severity = 'medium';
    if (category_id) {
      const catRes = await db.query('SELECT severity FROM construction_categories WHERE id = $1', [category_id]);
      if (catRes.rowCount > 0) {
        severity = catRes.rows[0].severity;
      }
    }

    // Insert complaint
    const insertRes = await db.query(
      `INSERT INTO complaints 
       (complaint_number, citizen_id, description, address, latitude, longitude, ward_id, category_id, custom_category, status, severity, nearby_landmark)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', $10, $11)
       RETURNING *`,
      [
        compNum, 
        citizenId, 
        description, 
        address, 
        parseFloat(latitude), 
        parseFloat(longitude), 
        parseInt(ward_id), 
        category_id ? parseInt(category_id) : null,
        custom_category || null, 
        severity, 
        nearby_landmark || ''
      ]
    );

    const complaint = insertRes.rows[0];

    // Save Status History
    await db.query(
      `INSERT INTO complaint_status_history (complaint_id, status, updated_by, remarks) 
       VALUES ($1, 'pending', $2, 'Complaint registered online.')`,
      [complaint.id, citizenId]
    );

    // Handle Uploaded File
    let imageId = null;
    let filePath = '';
    if (req.file) {
      filePath = `/uploads/${req.file.filename}`;
      const size = req.file.size;
      const type = req.file.mimetype;

      const imgRes = await db.query(
        `INSERT INTO complaint_images (complaint_id, file_path, file_size, file_type) 
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [complaint.id, filePath, size, type]
      );
      imageId = imgRes.rows[0].id;
    }

    // Trigger AI verification simulation
    const aiResult = analyzeImage(description, req.file ? req.file.filename : 'no-image.jpg');
    
    // Save AI findings
    await db.query(
      `INSERT INTO ai_analysis (complaint_id, image_id, prediction_label, confidence_score, recommendation, raw_response) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        complaint.id, 
        imageId, 
        aiResult.prediction_label, 
        aiResult.confidence_score, 
        aiResult.recommendation, 
        aiResult.raw_response
      ]
    );

    // Send notifications to Admin/Engineers about critical/high complaints
    const adminUserRes = await db.query("SELECT id FROM users WHERE role = 'engineer' OR role = 'admin'");
    for (const u of adminUserRes.rows) {
      await db.query(
        `INSERT INTO notifications (user_id, type, title, message) 
         VALUES ($1, 'status_change', 'New Complaint Filed', $2)`,
        [u.id, `A new complaint ${compNum} has been registered with severity ${severity}.`]
      );
    }

    // Citizen notification
    await db.query(
      `INSERT INTO notifications (user_id, type, title, message) 
       VALUES ($1, 'status_change', 'Complaint Registered', $2)`,
      [citizenId, `Your complaint ${compNum} has been registered successfully and is undergoing AI review.`]
    );

    logger.info(`Complaint filed: ${compNum} by Citizen ID: ${citizenId}`);
    
    res.status(201).json({
      message: 'Complaint submitted successfully and analyzed by AI.',
      complaint,
      aiAnalysis: aiResult,
      filePath
    });

  } catch (err) {
    logger.error('Create complaint error', { error: err.message });
    res.status(500).json({ message: 'Server error creating complaint' });
  }
}

// 2. Get complaints list (with sorting and filters)
async function getComplaints(req, res) {
  const { status, category_id, ward_id, zone_id, search, severity, min_ai_confidence } = req.query;
  const user = req.user;

  let queryText = `
    SELECT c.*, 
           w.name as ward_name, 
           w.code as ward_code,
           z.name as zone_name,
           cc.name as category_name,
           ai.prediction_label as ai_label,
           ai.confidence_score as ai_confidence,
           u.full_name as citizen_name
    FROM complaints c
    LEFT JOIN wards w ON c.ward_id = w.id
    LEFT JOIN zones z ON w.zone_id = z.id
    LEFT JOIN construction_categories cc ON c.category_id = cc.id
    LEFT JOIN ai_analysis ai ON c.id = ai.complaint_id
    LEFT JOIN users u ON c.citizen_id = u.id
    WHERE c.deleted_at IS NULL
  `;
  
  const params = [];
  let paramIndex = 1;

  // Filter based on User Role
  if (user.role === 'citizen') {
    queryText += ` AND c.citizen_id = $${paramIndex++}`;
    params.push(user.id);
  } else if (user.role === 'officer') {
    // Officers only see complaints assigned to them
    queryText += ` AND c.id IN (
      SELECT complaint_id FROM officer_assignments oa
      INNER JOIN officers o ON oa.officer_id = o.id
      WHERE o.user_id = $${paramIndex++} AND oa.status != 'cancelled'
    )`;
    params.push(user.id);
  }

  // General Filters
  if (status) {
    queryText += ` AND c.status = $${paramIndex++}`;
    params.push(status);
  }
  if (category_id) {
    queryText += ` AND c.category_id = $${paramIndex++}`;
    params.push(parseInt(category_id));
  }
  if (ward_id) {
    queryText += ` AND c.ward_id = $${paramIndex++}`;
    params.push(parseInt(ward_id));
  }
  if (zone_id) {
    queryText += ` AND w.zone_id = $${paramIndex++}`;
    params.push(parseInt(zone_id));
  }
  if (severity) {
    queryText += ` AND c.severity = $${paramIndex++}`;
    params.push(severity);
  }
  if (min_ai_confidence) {
    queryText += ` AND ai.confidence_score >= $${paramIndex++}`;
    params.push(parseFloat(min_ai_confidence));
  }
  if (search) {
    queryText += ` AND (
      c.complaint_number ILIKE $${paramIndex} OR 
      c.description ILIKE $${paramIndex} OR 
      c.address ILIKE $${paramIndex} OR 
      u.full_name ILIKE $${paramIndex}
    )`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  // Order by latest
  queryText += ' ORDER BY c.created_at DESC';

  try {
    const listRes = await db.query(queryText, params);
    res.json(listRes.rows);
  } catch (err) {
    logger.error('Get complaints error', { error: err.message });
    res.status(500).json({ message: 'Server error retrieving complaints' });
  }
}

// 3. Get complaint detail
async function getComplaintDetails(req, res) {
  const { id } = req.params;

  try {
    // Main complaint details
    const compRes = await db.query(
      `SELECT c.*, 
              w.name as ward_name, 
              w.code as ward_code,
              z.name as zone_name,
              z.id as zone_id,
              cc.name as category_name,
              u.full_name as citizen_name,
              u.email as citizen_email,
              u.phone_number as citizen_phone
       FROM complaints c
       LEFT JOIN wards w ON c.ward_id = w.id
       LEFT JOIN zones z ON w.zone_id = z.id
       LEFT JOIN construction_categories cc ON c.category_id = cc.id
       LEFT JOIN users u ON c.citizen_id = u.id
       WHERE c.id = $1 AND c.deleted_at IS NULL`,
      [id]
    );

    if (compRes.rowCount === 0) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    const complaint = compRes.rows[0];

    // Images
    const imgRes = await db.query('SELECT * FROM complaint_images WHERE complaint_id = $1', [id]);
    complaint.images = imgRes.rows;

    // AI Analysis
    const aiRes = await db.query('SELECT * FROM ai_analysis WHERE complaint_id = $1 ORDER BY id DESC LIMIT 1', [id]);
    complaint.ai_analysis = aiRes.rows[0] || null;

    // Status History
    const historyRes = await db.query(
      `SELECT h.*, u.full_name as updated_by_name, u.role as updated_by_role
       FROM complaint_status_history h
       JOIN users u ON h.updated_by = u.id
       WHERE h.complaint_id = $1 ORDER BY h.created_at ASC`,
      [id]
    );
    complaint.status_history = historyRes.rows;

    // Assignments
    const assignRes = await db.query(
      `SELECT a.*, o.badge_number, u.full_name as officer_name, u.email as officer_email
       FROM officer_assignments a
       JOIN officers o ON a.officer_id = o.id
       JOIN users u ON o.user_id = u.id
       WHERE a.complaint_id = $1 AND a.status != 'cancelled'
       ORDER BY a.created_at DESC`,
      [id]
    );
    complaint.assignments = assignRes.rows;

    // Inspection reports (if any)
    const reportsRes = await db.query(
      `SELECT r.*, u.full_name as officer_name
       FROM inspection_reports r
       JOIN officers o ON r.officer_id = o.id
       JOIN users u ON o.user_id = u.id
       WHERE r.assignment_id IN (
         SELECT id FROM officer_assignments WHERE complaint_id = $1
       ) ORDER BY r.created_at DESC`,
      [id]
    );
    complaint.inspection_reports = reportsRes.rows;

    // Feedback
    const fbRes = await db.query('SELECT * FROM feedback WHERE complaint_id = $1', [id]);
    complaint.feedback = fbRes.rows[0] || null;

    res.json(complaint);
  } catch (err) {
    logger.error('Get complaint detail error', { error: err.message, complaint_id: id });
    res.status(500).json({ message: 'Server error retrieving details' });
  }
}

// 4. Update complaint status
async function updateComplaintStatus(req, res) {
  const { id } = req.params;
  const { status, remarks } = req.body;
  const userId = req.user.id;

  if (!status) {
    return res.status(400).json({ message: 'Status field is required.' });
  }

  try {
    const compRes = await db.query('SELECT * FROM complaints WHERE id = $1 AND deleted_at IS NULL', [id]);
    if (compRes.rowCount === 0) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    const complaint = compRes.rows[0];

    // Update complaint status
    await db.query(
      'UPDATE complaints SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [status, id]
    );

    // Save History
    await db.query(
      `INSERT INTO complaint_status_history (complaint_id, status, updated_by, remarks) 
       VALUES ($1, $2, $3, $4)`,
      [id, status, userId, remarks || `Status updated to ${status}`]
    );

    // Notify Citizen
    await db.query(
      `INSERT INTO notifications (user_id, type, title, message) 
       VALUES ($1, 'status_change', 'Complaint Status Updated', $2)`,
      [
        complaint.citizen_id, 
        `Your complaint ${complaint.complaint_number} status has been updated to: ${status.toUpperCase()}. Remarks: ${remarks || 'None'}`
      ]
    );

    logger.info(`Complaint ID: ${id} status updated to: ${status} by User: ${userId}`);

    res.json({ message: 'Complaint status updated and citizen notified successfully.' });
  } catch (err) {
    logger.error('Update status error', { error: err.message });
    res.status(500).json({ message: 'Server error updating status' });
  }
}

// 5. Submit Citizen Feedback
async function addFeedback(req, res) {
  const { id } = req.params; // complaint ID
  const { rating, comments } = req.body;
  const citizenId = req.user.id;

  if (!rating) {
    return res.status(400).json({ message: 'Rating is required.' });
  }

  try {
    const compRes = await db.query('SELECT id, citizen_id, status FROM complaints WHERE id = $1', [id]);
    if (compRes.rowCount === 0) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    const complaint = compRes.rows[0];
    if (complaint.citizen_id !== citizenId) {
      return res.status(403).json({ message: 'You can only leave feedback on your own complaints.' });
    }

    // Insert feedback
    await db.query(
      'INSERT INTO feedback (complaint_id, citizen_id, rating, comments) VALUES ($1, $2, $3, $4)',
      [id, citizenId, rating, comments || '']
    );

    res.status(201).json({ message: 'Feedback submitted. Thank you for your response!' });
  } catch (err) {
    logger.error('Add feedback error', { error: err.message });
    res.status(500).json({ message: 'Server error adding feedback' });
  }
}

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintDetails,
  updateComplaintStatus,
  addFeedback
};
