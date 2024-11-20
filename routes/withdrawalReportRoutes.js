const express = require('express');
const multer = require('multer');
const WithdrawalReportModel = require('../models/WithdrawalReportModel');
const { Op } = require('sequelize');
const router = express.Router();
const fs = require('fs');
const xlsx = require('xlsx'); 

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Bulk Upload Endpoint
// Bulk Upload Endpoint
router.post('/bulk-upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    console.log("Uploaded file details:", file);

    if (!file) {
      return res.status(400).json({ message: 'Please upload an Excel file.' });
    }

    const workbook = xlsx.readFile(file.path);
    console.log("Workbook content:", workbook);

    const sheetName = workbook.SheetNames[0];
    console.log("Sheet Name:", sheetName);

    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    console.log("Parsed Sheet Data:", sheetData);

    if (sheetData.length === 0) {
      return res.status(400).json({ message: "No valid data found in the file." });
    }

    res.status(200).json({ message: "File processed successfully.", data: sheetData });
  } catch (error) {
    console.error("Error processing file:", error);
    return res.status(500).json({ message: "Error processing file.", error });
  }
});


// POST API to add a new withdrawal entry
router.post('/add-entry', async (req, res) => {
  try {
    const { user_id, amount, bank, branch_id, remark } = req.body;

    // Validate required fields
    if (!user_id || !amount || !bank || !branch_id) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    
    const newEntry = await WithdrawalReportModel.create({
      user_id,
      amount,
      bank,
      branch_id,
      remark: remark || '',
      date: new Date(),
    });

    res.status(201).json({ message: 'Withdrawal entry added successfully.', data: newEntry });
  } catch (error) {
    console.error('Error adding withdrawal entry:', error);
    res.status(500).json({ message: 'Error adding withdrawal entry.', error });
  }
});

// GET API to fetch all withdrawal entries
router.get('/entries', async (req, res) => {
  try {
    // Fetch all entries from the WithdrawalReportModel
    const entries = await WithdrawalReportModel.findAll({
      order: [['createdAt', 'DESC']], // Sort by createdAt in descending order
    });

    res.status(200).json({ message: 'Withdrawal entries retrieved successfully.', data: entries });
  } catch (error) {
    console.error('Error fetching withdrawal entries:', error);
    res.status(500).json({ message: 'Error fetching withdrawal entries.', error });
  }
});

// GET API to fetch entries filtered by bank and date range
router.get('/entries/report', async (req, res) => {
    try {
      const { startDate, endDate, bank_name } = req.query;
  
      // Validate required fields
      if (!startDate || !endDate || !bank_name) {
        return res.status(400).json({ message: 'Start date, end date, and bank name are required.' });
      }
  
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
  
      // Use the correct column name 'bank' instead of 'bank_name'
      const entries = await WithdrawalReportModel.findAll({
        where: {
          bank: {
            [Op.like]: `%${bank_name}%`,
          },
          createdAt: {
            [Op.between]: [start, end],
          },
        },
        order: [['createdAt', 'DESC']],
      });
  
      // Calculate the total withdrawal amount
      const totalAmount = entries.reduce((sum, entry) => sum + entry.amount, 0);
  
      res.status(200).json({ message: 'Report generated successfully.', data: entries, totalAmount });
    } catch (error) {
      console.error('Error generating report:', error);
      res.status(500).json({ message: 'Error generating report.', error: error.message });
    }
  });
  
  

module.exports = router;
