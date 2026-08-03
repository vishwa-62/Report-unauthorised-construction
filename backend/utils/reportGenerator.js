const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

// Generate PDF Report using pdfkit
function generatePDFReport(complaints, title) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    const buffers = [];

    doc.on('data', data => buffers.push(data));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', err => reject(err));

    // Header Panel
    doc.fillColor('#1e293b') // Slate 800
       .rect(0, 0, 595, 80)
       .fill();

    doc.fillColor('#ffffff')
       .fontSize(20)
       .font('Helvetica-Bold')
       .text('CITYGUARD AI - REPORT PORTAL', 40, 22);

    doc.fontSize(10)
       .font('Helvetica')
       .text(title.toUpperCase(), 40, 48);

    doc.text(`Generated: ${new Date().toLocaleString()}`, 400, 35, { align: 'right' });

    // Body
    let y = 110;
    doc.fillColor('#0f172a').fontSize(14).font('Helvetica-Bold').text('Complaint Verification Grid', 40, y);
    y += 25;

    // Table Header
    doc.fillColor('#475569'); // Slate 600
    doc.rect(40, y, 515, 20).fill();
    doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold');
    doc.text('ID', 45, y + 6, { width: 80 });
    doc.text('Ward/Zone', 130, y + 6, { width: 80 });
    doc.text('Category', 215, y + 6, { width: 100 });
    doc.text('Severity', 320, y + 6, { width: 50 });
    doc.text('Status', 380, y + 6, { width: 60 });
    doc.text('Created At', 450, y + 6, { width: 100 });

    y += 20;

    // Table Rows
    doc.fillColor('#0f172a').font('Helvetica').fontSize(8);
    let alt = false;
    
    for (const item of complaints) {
      if (y > 750) {
        doc.addPage();
        y = 40;
        
        // Re-draw small header on new page
        doc.fillColor('#1e293b').rect(0, 0, 595, 40).fill();
        doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold').text('CITYGUARD REPORT CONTINUED...', 40, 15);
        y = 60;
      }

      // Draw row background alternating colors
      if (alt) {
        doc.fillColor('#f8fafc').rect(40, y, 515, 20).fill();
      }
      doc.fillColor('#0f172a');
      
      const compNo = item.complaint_number || `ID-${item.id}`;
      const ward = item.ward_name || `Ward ${item.ward_id}`;
      const category = item.category_name || item.custom_category || 'General';
      const severity = (item.severity || 'Medium').toUpperCase();
      const status = (item.status || 'Pending').toUpperCase();
      const date = item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A';

      doc.text(compNo, 45, y + 6, { width: 80 });
      doc.text(ward, 130, y + 6, { width: 80 });
      doc.text(category, 215, y + 6, { width: 100 });
      doc.text(severity, 320, y + 6, { width: 50 });
      doc.text(status, 380, y + 6, { width: 60 });
      doc.text(date, 450, y + 6, { width: 100 });

      y += 20;
      alt = !alt;
    }

    doc.end();
  });
}

// Generate Excel Report using exceljs
async function generateExcelReport(complaints, title) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Complaints');

  // Header Title
  worksheet.mergeCells('A1:G1');
  const titleRow = worksheet.getRow(1);
  titleRow.getCell(1).value = `CityGuard AI - ${title}`;
  titleRow.getCell(1).font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFF' } };
  titleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E293B' } };
  titleRow.getCell(1).alignment = { horizontal: 'center' };
  titleRow.height = 40;

  // Metadata Row
  worksheet.mergeCells('A2:G2');
  const metaRow = worksheet.getRow(2);
  metaRow.getCell(1).value = `Report Generated: ${new Date().toLocaleString()} | Total Cases: ${complaints.length}`;
  metaRow.getCell(1).font = { name: 'Arial', size: 10, italic: true };
  metaRow.getCell(1).alignment = { horizontal: 'center' };
  metaRow.height = 20;

  // Table Headers
  const headers = ['Complaint #', 'Ward / Zone', 'Description', 'Category', 'Severity', 'Status', 'Date Submitted'];
  worksheet.getRow(4).values = headers;
  const headerRow = worksheet.getRow(4);
  headerRow.height = 25;
  
  headerRow.eachCell((cell) => {
    cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '475569' } };
    cell.alignment = { vertical: 'middle', horizontal: 'left' };
  });

  // Table Data
  complaints.forEach((item, index) => {
    const rowNum = 5 + index;
    const dateStr = item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A';
    const ward = item.ward_name || `Ward ${item.ward_id}`;
    const category = item.category_name || item.custom_category || 'General';

    worksheet.getRow(rowNum).values = [
      item.complaint_number || `ID-${item.id}`,
      ward,
      item.description || '',
      category,
      (item.severity || 'Medium').toUpperCase(),
      (item.status || 'Pending').toUpperCase(),
      dateStr
    ];
    worksheet.getRow(rowNum).height = 20;
    
    // Style alternating rows
    if (index % 2 === 1) {
      worksheet.getRow(rowNum).eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8FAFC' } };
      });
    }
  });

  // Set Column Widths
  worksheet.getColumn(1).width = 15;
  worksheet.getColumn(2).width = 20;
  worksheet.getColumn(3).width = 40;
  worksheet.getColumn(4).width = 20;
  worksheet.getColumn(5).width = 12;
  worksheet.getColumn(6).width = 12;
  worksheet.getColumn(7).width = 15;

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

module.exports = {
  generatePDFReport,
  generateExcelReport
};
