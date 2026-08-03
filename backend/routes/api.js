const express = require('express');
const router = express.Router();

const { authenticateToken, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Controllers
const authController = require('../controllers/authController');
const complaintsController = require('../controllers/complaintsController');
const officersController = require('../controllers/officersController');
const reportsController = require('../controllers/reportsController');
const analyticsController = require('../controllers/analyticsController');
const adminController = require('../controllers/adminController');

// 1. Authentication Routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/forgot-password', authController.forgotPassword);
router.post('/auth/verify-otp', authController.verifyOTP);
router.get('/auth/profile', authenticateToken, authController.getProfile);
router.put('/auth/profile', authenticateToken, authController.updateProfile);

// 2. Complaint Routes
// Note: Multer middleware 'upload.single("image")' handles single image uploads under key 'image'
router.post('/complaints', authenticateToken, upload.single('image'), complaintsController.createComplaint);
router.get('/complaints', authenticateToken, complaintsController.getComplaints);
router.get('/complaints/:id', authenticateToken, complaintsController.getComplaintDetails);
router.put('/complaints/:id/status', authenticateToken, requireRole(['engineer', 'admin']), complaintsController.updateComplaintStatus);
router.post('/complaints/:id/feedback', authenticateToken, requireRole('citizen'), complaintsController.addFeedback);

// 3. Officer & Inspection Routes
router.get('/officers', authenticateToken, requireRole(['engineer', 'admin']), officersController.getOfficers);
router.post('/officers/assign', authenticateToken, requireRole(['engineer', 'admin']), officersController.assignOfficer);
router.get('/officers/assigned', authenticateToken, requireRole('officer'), officersController.getAssignedComplaints);
router.post('/officers/report', authenticateToken, requireRole('officer'), officersController.submitInspectionReport);

// 4. Reporting Routes
router.get('/reports/pdf', authenticateToken, requireRole(['engineer', 'admin']), reportsController.exportPDF);
router.get('/reports/excel', authenticateToken, requireRole(['engineer', 'admin']), reportsController.exportExcel);

// 5. Analytics Routes
router.get('/analytics/metrics', authenticateToken, requireRole(['engineer', 'admin']), analyticsController.getMetrics);

// 6. Admin Control Routes
router.get('/admin/users', authenticateToken, requireRole('admin'), adminController.getUsers);
router.put('/admin/users/:id/toggle', authenticateToken, requireRole('admin'), adminController.toggleUserStatus);
router.get('/admin/settings', authenticateToken, requireRole('admin'), adminController.getSettings);
router.put('/admin/settings', authenticateToken, requireRole('admin'), adminController.updateSettings);
router.get('/admin/wards', authenticateToken, adminController.getWards); // accessible to auth users to fill forms
router.get('/admin/zones', authenticateToken, adminController.getZones);
router.get('/admin/categories', authenticateToken, adminController.getCategories);
router.get('/admin/audit-logs', authenticateToken, requireRole('admin'), adminController.getAuditLogs);

// 7. Notification Routes
router.get('/notifications', authenticateToken, adminController.getNotifications);
router.put('/notifications/:id/read', authenticateToken, adminController.markNotificationRead);

module.exports = router;
