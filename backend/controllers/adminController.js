const db = require('../config/db');
const logger = require('../utils/logger');

// 1. Get all system users (filtered)
async function getUsers(req, res) {
  const { role, search } = req.query;
  let sql = 'SELECT id, email, full_name, phone_number, role, is_active, email_verified, created_at FROM users WHERE deleted_at IS NULL';
  const params = [];
  let paramIdx = 1;

  if (role) {
    sql += ` AND role = $${paramIdx++}`;
    params.push(role);
  }

  if (search) {
    sql += ` AND (full_name ILIKE $${paramIdx} OR email ILIKE $${paramIdx} OR phone_number ILIKE $${paramIdx})`;
    params.push(`%${search}%`);
    paramIdx++;
  }

  sql += ' ORDER BY created_at DESC';

  try {
    const usersRes = await db.query(sql, params);
    res.json(usersRes.rows);
  } catch (err) {
    logger.error('Admin getUsers error', { error: err.message });
    res.status(500).json({ message: 'Server error retrieving users' });
  }
}

// 2. Toggle user account status
async function toggleUserStatus(req, res) {
  const { id } = req.params;
  const { is_active } = req.body;

  if (is_active === undefined) {
    return res.status(400).json({ message: 'is_active state is required.' });
  }

  try {
    await db.query('UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [is_active, id]);
    logger.info(`User ID ${id} is_active toggled to ${is_active} by Admin ID ${req.user.id}`);
    res.json({ message: 'User status updated successfully.' });
  } catch (err) {
    logger.error('Admin toggle status error', { error: err.message });
    res.status(500).json({ message: 'Server error updating user state' });
  }
}

// 3. Retrieve system settings
async function getSettings(req, res) {
  try {
    const settingsRes = await db.query('SELECT * FROM system_settings ORDER BY setting_key ASC');
    res.json(settingsRes.rows);
  } catch (err) {
    logger.error('Admin getSettings error', { error: err.message });
    res.status(500).json({ message: 'Server error retrieving system settings' });
  }
}

// 4. Update system settings
async function updateSettings(req, res) {
  const { settings } = req.body; // Array of { key, value }

  if (!settings || !Array.isArray(settings)) {
    return res.status(400).json({ message: 'Settings must be an array of key-value pairs.' });
  }

  try {
    for (const item of settings) {
      await db.query(
        'INSERT INTO system_settings (setting_key, setting_value) VALUES ($1, $2) ON CONFLICT (setting_key) DO UPDATE SET setting_value = $2, updated_at = CURRENT_TIMESTAMP',
        [item.setting_key, item.setting_value]
      );
    }
    
    logger.info(`System settings updated by Admin ID ${req.user.id}`);
    res.json({ message: 'Settings updated successfully.' });
  } catch (err) {
    logger.error('Admin updateSettings error', { error: err.message });
    res.status(500).json({ message: 'Server error updating system settings' });
  }
}

// 5. Get wards list (with zone relationship)
async function getWards(req, res) {
  try {
    const wardsRes = await db.query(`
      SELECT w.*, z.name as zone_name, z.code as zone_code
      FROM wards w
      JOIN zones z ON w.zone_id = z.id
      ORDER BY z.name ASC, w.name ASC
    `);
    res.json(wardsRes.rows);
  } catch (err) {
    logger.error('Admin getWards error', { error: err.message });
    res.status(500).json({ message: 'Server error retrieving wards' });
  }
}

// 6. Get zones list
async function getZones(req, res) {
  try {
    const zonesRes = await db.query('SELECT * FROM zones ORDER BY name ASC');
    res.json(zonesRes.rows);
  } catch (err) {
    logger.error('Admin getZones error', { error: err.message });
    res.status(500).json({ message: 'Server error retrieving zones' });
  }
}

// 7. Get category types
async function getCategories(req, res) {
  try {
    const catsRes = await db.query('SELECT * FROM construction_categories ORDER BY name ASC');
    res.json(catsRes.rows);
  } catch (err) {
    logger.error('Admin getCategories error', { error: err.message });
    res.status(500).json({ message: 'Server error retrieving categories' });
  }
}

// 8. Get audit logs
async function getAuditLogs(req, res) {
  try {
    const logsRes = await db.query(`
      SELECT a.*, u.full_name as user_name, u.role as user_role
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 100
    `);
    res.json(logsRes.rows);
  } catch (err) {
    logger.error('Admin getAuditLogs error', { error: err.message });
    res.status(500).json({ message: 'Server error retrieving audit logs' });
  }
}

// 9. Get notifications for a user
async function getNotifications(req, res) {
  try {
    const notifsRes = await db.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );
    res.json(notifsRes.rows);
  } catch (err) {
    logger.error('Get notifications error', { error: err.message });
    res.status(500).json({ message: 'Server error retrieving notifications' });
  }
}

// 10. Mark notification as read
async function markNotificationRead(req, res) {
  const { id } = req.params;
  try {
    await db.query('UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    res.json({ message: 'Notification marked as read.' });
  } catch (err) {
    logger.error('Mark notification read error', { error: err.message });
    res.status(500).json({ message: 'Server error updating notification status' });
  }
}

module.exports = {
  getUsers,
  toggleUserStatus,
  getSettings,
  updateSettings,
  getWards,
  getZones,
  getCategories,
  getAuditLogs,
  getNotifications,
  markNotificationRead
};
