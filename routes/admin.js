const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

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
router.post(
  '/login',
  async (req, res) => {
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

      // Generate the token with the role inside
      const token = jwt.sign({ username: admin.username, role: admin.role }, JWT_SECRET, { expiresIn: '1h' });

      // Return the token and role in the response
      res.status(200).json({ success: true, message: 'Login successful', token, role: admin.role });
    } catch (error) {
      console.error('Error logging in admin:', error);
      res.status(500).json({ message: 'Error logging in', error: error.message });
    }
  }
);

module.exports = router;
