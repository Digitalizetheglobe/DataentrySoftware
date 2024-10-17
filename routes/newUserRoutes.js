const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Import jsonwebtoken for JWT handling
const nodemailer = require('nodemailer'); // Import Nodemailer
const { Op } = require('sequelize');
const NewUserModel = require('../models/NewUserModel');
const router = express.Router();

// Your JWT secret (use a secure environment variable in production)
const JWT_SECRET = 'f293a9d53e157dcf81738d5bf916e7ab2b2cd86198f5891929eb7c0ae3d600e43febd83f3a8047d33778d6139f11de34fe6d25a4097317f496c05fe146e7e564';

// Generate a user ID based on first and last name and a global incrementing number
const generateUserId = async (firstName, lastName) => {
  const prefix = firstName + lastName.slice(0, 1).toUpperCase();

  // Find the latest user with the highest number part in their user_id
  const lastUser = await NewUserModel.findOne({
    order: [['id', 'DESC']], // Order by ID in descending order to get the latest user
    attributes: ['user_id'], // Only select the user_id field
  });

  let nextNumber = '001';
  if (lastUser && lastUser.user_id) {
    // Extract the numeric part from the last user's ID (e.g., JohnD001 -> 001)
    const lastNumber = parseInt(lastUser.user_id.match(/\d+$/)[0]) || 0;
    // Increment the number for the new user
    nextNumber = (lastNumber + 1).toString().padStart(3, '0');
  }

  return `${prefix}${nextNumber}`;
};

const generatePassword = () => {
  return Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4).toUpperCase();
};

// Configure Nodemailer transport
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can use any email service like Gmail, Outlook, etc.
  auth: {
    user: 'cfrerealty@gmail.com', // Replace with your email
    pass: 'eagm eali fezd dfzp'   // Replace with your email password or app-specific password
  }
});

// User registration route
router.post('/register', async (req, res) => {
  try {
    const { first_name, last_name, number, email, role, access_control, joining_date } = req.body;

    if (!first_name || !last_name || !number || !email || !role || !access_control || !joining_date) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const userId = await generateUserId(first_name, last_name);
    const password = generatePassword();
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await NewUserModel.create({
      first_name,
      last_name,
      number,
      email,
      role,
      access_control,
      joining_date,
      user_id: userId,
      password: hashedPassword,
    });

    // Prepare the email content
    const mailOptions = {
      from: 'cfrerealty@gmail.com',
      to: email,
      subject: 'Your Registration Details',
      text: `Hello ${first_name} ${last_name},\n\nYour registration was successful!\n\nYour User ID: ${userId}\nYour Password: ${password}\n\nPlease keep these credentials safe.\n\nBest Regards,\nYour Company Name`
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    res.status(201).json({
      message: 'User registered successfully and email sent.',
      user_id: userId,
      password, 
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user.', error });
  }
});

// User login route
router.post('/login', async (req, res) => {
  try {
    const { user_id, password } = req.body;

    // Validate request
    if (!user_id || !password) {
      return res.status(400).json({ message: 'User ID and password are required.' });
    }

    // Find user by user_id
    const user = await NewUserModel.findOne({ where: { user_id } });

    if (!user) {
      return res.status(400).json({ message: 'Invalid User ID or password.' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid User ID or password.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { user_id: user.user_id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login successful.',
      token,
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Error logging in.', error });
  }
});

module.exports = router;
