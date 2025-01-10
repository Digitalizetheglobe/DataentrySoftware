const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

// Middleware to verify token
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ message: 'Token is required.' });
  }

  try {
    const decoded = jwt.verify(token.split(' ')[1], JWT_SECRET); // Format: "Bearer <token>"
    req.user = decoded; // Attach decoded data to `req.user`
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
};

// Admin Registration
router.post(
  '/register',
  [
    body('firstName').notEmpty().withMessage('First name is required.'),
    body('lastName').notEmpty().withMessage('Last name is required.'),
    body('email').isEmail().withMessage('Invalid email format.'),
    body('username').notEmpty().withMessage('Username is required.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, username, password } = req.body;

    try {
      const existingAdmin = await Admin.findOne({ where: { username } });
      if (existingAdmin) {
        return res.status(400).json({ message: 'Username already exists.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newAdmin = await Admin.create({
        firstName,
        lastName,
        email,
        username,
        password: hashedPassword,
        role: 'admin',
      });

      const token = jwt.sign({ username: newAdmin.username, role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });

      res.status(201).json({ success: true, message: 'Admin registered successfully.', token });
    } catch (error) {
      console.error('Error registering admin:', error);
      res.status(500).json({ message: 'Error registering admin', error: error.message });
    }
  }
);

// Admin Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await Admin.findOne({ where: { username } });
    if (!admin) {
      return res.status(400).json({ message: 'Invalid username or password.' });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid username or password.' });
    }

    const token = jwt.sign({ username: admin.username, role: admin.role }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ success: true, message: 'Login successful', token, role: admin.role });
  } catch (error) {
    console.error('Error logging in admin:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// Get Admin Info by Token
router.get('/info', authenticateToken, async (req, res) => {
  try {
    const { username } = req.user; // Extract username from token
    const admin = await Admin.findOne({
      where: { username },
      attributes: { exclude: ['password'] }, // Exclude sensitive info
    });

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found.' });
    }

    res.status(200).json({ success: true, admin });
  } catch (error) {
    console.error('Error fetching admin info:', error);
    res.status(500).json({ message: 'Error fetching admin info', error: error.message });
  }
});



// Change Password Route
router.put(
  '/change-password',
  authenticateToken, // Ensure the admin is authenticated
  [
    body('oldPassword').notEmpty().withMessage('Old password is required.'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters long.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { oldPassword, newPassword } = req.body;
    const { username } = req.user; // Extract username from token

    try {
      // Find the admin by username
      const admin = await Admin.findOne({ where: { username } });
      if (!admin) {
        return res.status(404).json({ message: 'Admin not found.' });
      }

      // Verify the old password
      const isPasswordValid = await bcrypt.compare(oldPassword, admin.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Old password is incorrect.' });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update the admin's password
      admin.password = hashedPassword;
      await admin.save();

      res.status(200).json({ success: true, message: 'Password changed successfully.' });
    } catch (error) {
      console.error('Error changing password:', error);
      res.status(500).json({ message: 'Error changing password', error: error.message });
    }
  }
);


module.exports = router;
