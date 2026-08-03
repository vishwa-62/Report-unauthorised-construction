const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const logger = require('../utils/logger');

// Generate JWT Helper
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.full_name },
    process.env.JWT_SECRET || 'supersecret_cityguard_token_key_123',
    { expiresIn: '7d' }
  );
}

// 1. Citizen Register
async function register(req, res) {
  const { email, password, full_name, phone_number } = req.body;

  if (!email || !password || !full_name) {
    return res.status(400).json({ message: 'Email, password, and full name are required.' });
  }

  try {
    // Check if user exists
    const checkUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (checkUser.rowCount > 0) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Generate signup OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    // Insert user
    const insertRes = await db.query(
      `INSERT INTO users (email, password_hash, full_name, phone_number, role, otp, otp_expires_at) 
       VALUES ($1, $2, $3, $4, 'citizen', $5, $6) RETURNING id, email, full_name, role`,
      [email, passwordHash, full_name, phone_number || '', otp, otpExpires]
    );

    const newUser = insertRes.rows[0];
    const token = generateToken(newUser);

    logger.info(`Citizen registered: ${email}. Simulated OTP: ${otp}`);
    
    res.status(201).json({
      message: 'Registration successful. Verification code sent.',
      token,
      user: newUser,
      simulatedOTP: otp // Return for ease of local testing
    });
  } catch (err) {
    logger.error('Registration error', { error: err.message });
    res.status(500).json({ message: 'Server error during registration' });
  }
}

// 2. Login
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const userRes = await db.query('SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL', [email]);
    if (userRes.rowCount === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = userRes.rows[0];
    if (!user.is_active) {
      return res.status(403).json({ message: 'Your account has been deactivated.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);
    logger.info(`User logged in: ${email} (${user.role})`);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        email_verified: user.email_verified
      }
    });
  } catch (err) {
    logger.error('Login error', { error: err.message });
    res.status(500).json({ message: 'Server error during login' });
  }
}

// 3. Forgot Password
async function forgotPassword(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const userRes = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userRes.rowCount === 0) {
      // Don't leak exists status, return general message
      return res.json({ message: 'If email exists, an OTP has been sent.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await db.query('UPDATE users SET otp = $1, otp_expires_at = $2 WHERE email = $3', [otp, otpExpires, email]);
    
    logger.info(`Simulated OTP for password reset sent to ${email}: ${otp}`);

    res.json({
      message: 'OTP has been generated.',
      simulatedOTP: otp // For easy local validation
    });
  } catch (err) {
    logger.error('Forgot password error', { error: err.message });
    res.status(500).json({ message: 'Server error generating OTP' });
  }
}

// 4. Verify OTP (Verifies email or resets password depending on intent)
async function verifyOTP(req, res) {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP code are required.' });
  }

  try {
    const userRes = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userRes.rowCount === 0) {
      return res.status(400).json({ message: 'Invalid request' });
    }

    const user = userRes.rows[0];
    
    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Incorrect verification code.' });
    }

    const expires = new Date(user.otp_expires_at);
    if (expires < new Date()) {
      return res.status(400).json({ message: 'Verification code has expired.' });
    }

    // Reset password if newPassword provided, else verify email
    if (newPassword) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(newPassword, salt);
      await db.query(
        'UPDATE users SET password_hash = $1, otp = NULL, otp_expires_at = NULL, email_verified = TRUE WHERE id = $2',
        [passwordHash, user.id]
      );
      logger.info(`Password reset completed for: ${email}`);
      return res.json({ message: 'Password has been reset successfully.' });
    } else {
      await db.query(
        'UPDATE users SET email_verified = TRUE, otp = NULL, otp_expires_at = NULL WHERE id = $2',
        [user.id]
      );
      logger.info(`Email verified for user: ${email}`);
      return res.json({ message: 'Email verified successfully.' });
    }
  } catch (err) {
    logger.error('OTP Verification error', { error: err.message });
    res.status(500).json({ message: 'Server error during verification' });
  }
}

// 5. Get Current Profile
async function getProfile(req, res) {
  try {
    const userRes = await db.query(
      `SELECT id, email, full_name, phone_number, role, email_verified, created_at 
       FROM users WHERE id = $1`, 
      [req.user.id]
    );

    if (userRes.rowCount === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json(userRes.rows[0]);
  } catch (err) {
    logger.error('Get profile error', { error: err.message });
    res.status(500).json({ message: 'Server error retrieving profile' });
  }
}

// 6. Update Profile
async function updateProfile(req, res) {
  const { full_name, phone_number } = req.body;

  if (!full_name) {
    return res.status(400).json({ message: 'Full name is required' });
  }

  try {
    await db.query(
      'UPDATE users SET full_name = $1, phone_number = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
      [full_name, phone_number || '', req.user.id]
    );

    res.json({ message: 'Profile updated successfully.' });
  } catch (err) {
    logger.error('Update profile error', { error: err.message });
    res.status(500).json({ message: 'Server error updating profile' });
  }
}

module.exports = {
  register,
  login,
  forgotPassword,
  verifyOTP,
  getProfile,
  updateProfile
};
