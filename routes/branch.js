const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Branch = require('../models/Branch'); 
const router = express.Router();

// const JWT_SECRET = 'f293a9d53e157dcf81738d5bf916e7ab2b2cd86198f5891929eb7c0ae3d600e43febd83f3a8047d33778d6139f11de34fe6d25a4097317f496c05fe146e7e564'; 
const JWT_SECRET = process.env.JWT_SECRET || '83be0c55dbdf7b0ebf7994359ccdfe7b22fa89bf1f57d4793314a758790a5cd9873fc06cb284c6a30d75ad4f128683fcd04d6e5c15124315d6a02b6ab4c934cd';

// Branch Registration

router.post('/register', async (req, res) => {
  const { branch_id, password, role = 'branch' } = req.body; // Default role is 'branch'

  try {
    const existingBranch = await Branch.findOne({ where: { branch_id } });
    if (existingBranch) {
      return res.status(400).json({ message: 'Branch ID already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newBranch = await Branch.create({ branch_id, password: hashedPassword, role });

    const token = jwt.sign({ branch_id: newBranch.branch_id, role: newBranch.role }, JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ message: 'Branch registered successfully.', token });
  } catch (error) {
    console.error('Error registering branch:', error);
    res.status(500).json({ message: 'Error registering branch', error: error.message });
  }
});

  
// Branch Login
router.post('/login', async (req, res) => {
  const { branch_id, password } = req.body;

  try {
    const branch = await Branch.findOne({ where: { branch_id } });
    if (!branch) {
      return res.status(400).json({ message: 'Invalid branch ID or password.' });
    }

    const isPasswordValid = await bcrypt.compare(password, branch.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid branch ID or password.' });
    }

    const token = jwt.sign({ branch_id: branch.branch_id, role: branch.role }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', token, role: branch.role });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});


module.exports = router;
