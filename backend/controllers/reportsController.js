const db = require('../config/db');
const { generatePDFReport, generateExcelReport } = require('../utils/reportGenerator');
const logger = require('../utils/logger');

// Retrieve complaints matching filters for report compilation
async function queryComplaintsForReport(filters) {
  const { status, category_id, ward_id, zone_id, severity } = filters;
  
  let queryText = `
    SELECT c.id, c.complaint_number, c.description, c.address, c.status, c.severity, c.created_at,
           w.name as ward_name, cc.name as category_name
    FROM complaints c
    LEFT JOIN wards w ON c.ward_id = w.id
    LEFT JOIN zones z ON w.zone_id = z.id
    LEFT JOIN construction_categories cc ON c.category_id = cc.id
    WHERE c.deleted_at IS NULL
  `;
  
  const params = [];
  let paramIdx = 1;

  if (status) {
    queryText += ` AND c.status = $${paramIdx++}`;
    params.push(status);
  }
  if (category_id) {
    queryText += ` AND c.category_id = $${paramIdx++}`;
    params.push(parseInt(category_id));
  }
  if (ward_id) {
    queryText += ` AND c.ward_id = $${paramIdx++}`;
    params.push(parseInt(ward_id));
  }
  if (zone_id) {
    queryText += ` AND w.zone_id = $${paramIdx++}`;
    params.push(parseInt(zone_id));
  }
  if (severity) {
    queryText += ` AND c.severity = $${paramIdx++}`;
    params.push(severity);
  }

  queryText += ' ORDER BY c.created_at DESC';

  const res = await db.query(queryText, params);
  return res.rows;
}

// 1. Export PDF
async function exportPDF(req, res) {
  try {
    const complaints = await queryComplaintsForReport(req.query);
    const title = req.query.title || 'Municipal Construction Violation Report';
    
    const pdfBuffer = await generatePDFReport(complaints, title);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="cityguard-report.pdf"');
    res.send(pdfBuffer);
    
    logger.info(`PDF Report exported: ${complaints.length} records.`);
  } catch (err) {
    logger.error('Export PDF error', { error: err.message });
    res.status(500).json({ message: 'Server error generating PDF report' });
  }
}

// 2. Export Excel
async function exportExcel(req, res) {
  try {
    const complaints = await queryComplaintsForReport(req.query);
    const title = req.query.title || 'Municipal Construction Violation Report';
    
    const excelBuffer = await generateExcelReport(complaints, title);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="cityguard-report.xlsx"');
    res.send(excelBuffer);
    
    logger.info(`Excel Report exported: ${complaints.length} records.`);
  } catch (err) {
    logger.error('Export Excel error', { error: err.message });
    res.status(500).json({ message: 'Server error generating Excel report' });
  }
}

module.exports = {
  exportPDF,
  exportExcel
};
