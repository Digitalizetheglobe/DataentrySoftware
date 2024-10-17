const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const router = express.Router();

// Generate a user ID based on first and last name and increment
const generateUserId = async (firstName, lastName) => {
    // Construct the prefix using the first name and the first letter of the last name
    const prefix = firstName + lastName.slice(0, 1).toUpperCase();
  
    // Find the existing users with similar IDs and sort them in descending order
    const existingUsers = await User.findAll({
      where: {
        user_id: {
          [Op.like]: `${prefix}%`
        }
      },
      order: [['user_id', 'DESC']],
      limit: 1,
    });
  
    // Determine the next number to use
    let nextNumber = '001';
    if (existingUsers.length > 0) {
      const lastUserId = existingUsers[0].user_id;
      const lastNumber = parseInt(lastUserId.slice(prefix.length)) || 0;
      nextNumber = (lastNumber + 1).toString().padStart(3, '0');
    }
  
    // Combine the prefix and the next number to form the new user ID
    return `${prefix}${nextNumber}`;
  };
  

// Generate a strong random password
const generatePassword = () => {
  return Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4).toUpperCase();
};

// User registration route
router.post('/register', async (req, res) => {
  try {
    const { first_name, last_name, number, email, role, access_control, joining_date } = req.body;

    // Validate required fields
    if (!first_name || !last_name || !number || !email || !role || !access_control || !joining_date) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Generate user ID
    const userId = await generateUserId(first_name, last_name);

    // Generate hashed password
    const password = generatePassword();
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const newUser = await User.create({
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

    res.status(201).json({
      message: 'User registered successfully.',
      user_id: userId,
      password, // Consider sending the password securely (e.g., through email)
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user.', error });
  }
});

module.exports = router;
