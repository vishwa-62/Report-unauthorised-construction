const db = require('../config/db');
const logger = require('../utils/logger');

// 1. Get officers list with active assignment counts
async function getOfficers(req, res) {
  try {
    const listRes = await db.query(`
      SELECT o.id, o.badge_number, o.availability_status, 
             u.full_name as officer_name, u.email as officer_email, u.phone_number,
             d.name as department_name, 
             z.name as zone_name, 
             w.name as ward_name,
             (SELECT COUNT(*) FROM officer_assignments oa WHERE oa.officer_id = o.id AND oa.status = 'assigned') as active_assignments
      FROM officers o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN departments d ON o.department_id = d.id
      LEFT JOIN zones z ON o.zone_id = z.id
      LEFT JOIN wards w ON o.ward_id = w.id
      WHERE u.deleted_at IS NULL
    `);
    
    res.json(listRes.rows);
  } catch (err) {
    logger.error('Get officers error', { error: err.message });
    res.status(500).json({ message: 'Server error retrieving officers' });
  }
}

// 2. Assign officer to a complaint (Engineer / Admin)
async function assignOfficer(req, res) {
  const { complaint_id, officer_id, remarks } = req.body;
  const assignedBy = req.user.id;

  if (!complaint_id || !officer_id) {
    return res.status(400).json({ message: 'Complaint ID and Officer ID are required.' });
  }

  try {
    // Check if complaint is valid
    const compRes = await db.query('SELECT complaint_number, status, citizen_id FROM complaints WHERE id = $1', [complaint_id]);
    if (compRes.rowCount === 0) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }
    const complaint = compRes.rows[0];

    // Check if officer is valid
    const officerRes = await db.query('SELECT o.id, o.user_id, u.full_name FROM officers o JOIN users u ON o.user_id = u.id WHERE o.id = $1', [officer_id]);
    if (officerRes.rowCount === 0) {
      return res.status(404).json({ message: 'Officer not found.' });
    }
    const officer = officerRes.rows[0];

    // Create assignment
    const assignRes = await db.query(
      `INSERT INTO officer_assignments (complaint_id, officer_id, assigned_by, status, remarks)
       VALUES ($1, $2, $3, 'assigned', $4) RETURNING id`,
      [complaint_id, officer_id, assignedBy, remarks || '']
    );

    // Update complaint status to 'assigned'
    await db.query(
      `UPDATE complaints SET status = 'assigned', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [complaint_id]
    );

    // Save Status History
    await db.query(
      `INSERT INTO complaint_status_history (complaint_id, status, updated_by, remarks) 
       VALUES ($1, 'assigned', $2, $3)`,
      [complaint_id, 'assigned', assignedBy, `Assigned to Inspector ${officer.full_name}.`]
    );

    // Notify Officer (user_id of officer)
    await db.query(
      `INSERT INTO notifications (user_id, type, title, message) 
       VALUES ($1, 'assignment', 'New Site Inspection Assigned', $2)`,
      [officer.user_id, `You have been assigned to verify complaint: ${complaint.complaint_number}. Remarks: ${remarks || 'None'}`]
    );

    // Notify Citizen
    await db.query(
      `INSERT INTO notifications (user_id, type, title, message) 
       VALUES ($1, 'status_change', 'Field Officer Assigned', $2)`,
      [complaint.citizen_id, `Field officer ${officer.full_name} has been assigned to inspect the site of your complaint: ${complaint.complaint_number}.`]
    );

    logger.info(`Complaint ${complaint.complaint_number} assigned to Officer ID ${officer_id} by Engineer ${assignedBy}`);

    res.status(201).json({
      message: 'Officer assigned successfully.',
      assignmentId: assignRes.rows[0].id
    });

  } catch (err) {
    logger.error('Assign officer error', { error: err.message });
    res.status(500).json({ message: 'Server error during assignment' });
  }
}

// 3. Get officer's own assigned complaints (Officer only)
async function getAssignedComplaints(req, res) {
  const userId = req.user.id;

  try {
    const listRes = await db.query(
      `SELECT oa.id as assignment_id, oa.status as assignment_status, oa.remarks as assignment_remarks, oa.created_at as assigned_date,
              c.id as complaint_id, c.complaint_number, c.description, c.address, c.latitude, c.longitude, c.severity,
              w.name as ward_name, cc.name as category_name
       FROM officer_assignments oa
       JOIN complaints c ON oa.complaint_id = c.id
       JOIN officers o ON oa.officer_id = o.id
       LEFT JOIN wards w ON c.ward_id = w.id
       LEFT JOIN construction_categories cc ON c.category_id = cc.id
       WHERE o.user_id = $1 AND oa.status = 'assigned'`,
      [userId]
    );

    res.json(listRes.rows);
  } catch (err) {
    logger.error('Get officer complaints error', { error: err.message });
    res.status(500).json({ message: 'Server error retrieving assigned complaints' });
  }
}

// 4. Submit Inspection Report (Officer only)
async function submitInspectionReport(req, res) {
  const { assignment_id, findings, recommendation, status_update, latitude, longitude } = req.body;
  const userId = req.user.id;

  if (!assignment_id || !findings || !status_update) {
    return res.status(400).json({ message: 'Assignment ID, findings, and recommended status are required.' });
  }

  try {
    // Verify assignment and officer
    const assignRes = await db.query(
      `SELECT oa.*, c.id as complaint_id, c.complaint_number, c.citizen_id 
       FROM officer_assignments oa 
       JOIN complaints c ON oa.complaint_id = c.id
       JOIN officers o ON oa.officer_id = o.id
       WHERE oa.id = $1 AND o.user_id = $2`,
      [assignment_id, userId]
    );

    if (assignRes.rowCount === 0) {
      return res.status(404).json({ message: 'Assignment not found or not assigned to you.' });
    }

    const assignment = assignRes.rows[0];
    const officerRes = await db.query('SELECT id FROM officers WHERE user_id = $1', [userId]);
    const officerId = officerRes.rows[0].id;

    // Create inspection report
    await db.query(
      `INSERT INTO inspection_reports (assignment_id, officer_id, findings, recommendation, status_update, latitude, longitude)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        assignment_id, 
        officerId, 
        findings, 
        recommendation || '', 
        status_update, 
        latitude ? parseFloat(latitude) : null,
        longitude ? parseFloat(longitude) : null
      ]
    );

    // Update assignment status to 'completed'
    await db.query(
      "UPDATE officer_assignments SET status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
      [assignment_id]
    );

    // Update complaint status to 'inspected'
    await db.query(
      "UPDATE complaints SET status = 'inspected', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
      [assignment.complaint_id]
    );

    // Update Status History
    await db.query(
      `INSERT INTO complaint_status_history (complaint_id, status, updated_by, remarks) 
       VALUES ($1, 'inspected', $2, $3)`,
      [assignment.complaint_id, userId, `Site inspected by officer. Findings: ${findings.substring(0, 100)}...`]
    );

    // Notify citizen
    await db.query(
      `INSERT INTO notifications (user_id, type, title, message) 
       VALUES ($1, 'status_change', 'Inspection Completed', $2)`,
      [assignment.citizen_id, `Inspection completed for your complaint ${assignment.complaint_number}. Verification report submitted to Municipal Engineers for final approval.`]
    );

    // Notify Engineers
    const engRes = await db.query("SELECT id FROM users WHERE role = 'engineer' OR role = 'admin'");
    for (const u of engRes.rows) {
      await db.query(
        `INSERT INTO notifications (user_id, type, title, message) 
         VALUES ($1, 'status_change', 'Inspection Report Filed', $2)`,
        [u.id, `Officer inspection report filed for ${assignment.complaint_number}. Verification status proposed: ${status_update.toUpperCase()}.`]
      );
    }

    logger.info(`Inspection report filed for assignment: ${assignment_id} by Officer: ${officerId}`);

    res.status(201).json({ message: 'Inspection report submitted successfully.' });
  } catch (err) {
    logger.error('Submit report error', { error: err.message });
    res.status(500).json({ message: 'Server error submitting inspection report' });
  }
}

module.exports = {
  getOfficers,
  assignOfficer,
  getAssignedComplaints,
  submitInspectionReport
};
