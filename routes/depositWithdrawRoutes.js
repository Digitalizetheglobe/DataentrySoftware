const express = require('express');
const DepositWithdrawModel = require('../models/DepositWithdrawModel');
const PlayerModel = require('../models/PlayerModel');
const multer = require('multer');
const XLSX = require('xlsx');
const router = express.Router();
const { Op } = require('sequelize');

// Setup multer for file uploads
const upload = multer({ dest: 'uploads/' });

router.post('/add-entry', async (req, res) => {
  try {
    const { player_id, branch_id, utr_id, amount, bank_name, remark } = req.body;

    // Validate required fields
    if (!player_id || !branch_id || !utr_id || !amount || !bank_name) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Check if UTR already exists
    const existingEntry = await DepositWithdrawModel.findOne({ where: { utr_id } });
    if (existingEntry) {
      return res.status(400).json({ message: 'UTR ID already exists. Please use a different UTR ID.' });
    }

    // Directly create the entry in the DepositWithdrawModel
    const newEntry = await DepositWithdrawModel.create({
      player_id,
      branch_id,
      utr_id,
      amount,
      bank_name,
      remark: remark || '',
      date: new Date(), 
    });

    res.status(201).json({ message: 'Entry added successfully.', data: newEntry });
  } catch (error) {
    console.error('Error adding entry:', error);
    res.status(500).json({ message: 'Error adding entry.', error });
  }
});

// POST API to upload an Excel file and add entries
router.post('/upload-excel', upload.single('file'), async (req, res) => {
    try {
      console.log('Received a request to upload an Excel file.');
  
      // Check if file is uploaded
      if (!req.file) {
        console.log('No file uploaded.');
        return res.status(400).json({ message: 'Please upload an Excel file.' });
      }
  
      console.log('File uploaded:', req.file.path);
  
      // Read the uploaded Excel file
      const workbook = XLSX.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
  
      console.log('Reading data from sheet:', sheetName);
  
      // Convert the sheet to JSON
      const data = XLSX.utils.sheet_to_json(sheet);
      console.log('Parsed data from Excel:', data);
  
      // Loop through each entry and add it to the database
      const results = [];
      for (const entry of data) {
        const { player_id, branch_id, utr_id, amount, bank_name, remark } = entry;
  
        console.log('Processing entry:', entry);
  
        // Validate required fields
        if (!player_id || !branch_id || !utr_id || !amount || !bank_name) {
          console.log('Validation failed for entry:', entry);
          results.push({ utr_id: utr_id || 'N/A', status: 'Skipped', message: 'Missing required fields.' });
          continue; 
        }
  
        // Check if UTR already exists
        const existingEntry = await DepositWithdrawModel.findOne({ where: { utr_id } });
        if (existingEntry) {
          console.log(`UTR ID ${utr_id} already exists. Skipping entry.`);
          results.push({ utr_id, status: 'Skipped', message: 'UTR ID already exists.' });
          continue;
        }
  
        // Create the entry in the DepositWithdrawModel
        await DepositWithdrawModel.create({
          player_id,
          branch_id,
          utr_id,
          amount,
          bank_name,
          remark: remark || '',
          date: new Date(),
        });
  
        console.log(`UTR ID ${utr_id} added successfully.`);
        results.push({ utr_id, status: 'Added' });
      }
  
      console.log('All entries processed. Returning response.');
      res.status(201).json({ message: 'Entries processed successfully.', results });
    } catch (error) {
      console.error('Error processing Excel file:', error);
      res.status(500).json({ message: 'Error processing Excel file.', error });
    }
  });
  

// GET API to fetch all entries
router.get('/entries', async (req, res) => {
  try {
    // Fetch all entries from the DepositWithdrawModel, ordered by created_at in descending order
    const entries = await DepositWithdrawModel.findAll({
      order: [['created_at', 'DESC']], // Sort by created_at in descending order
    });

    res.status(200).json({ message: 'Entries retrieved successfully.', data: entries });
  } catch (error) {
    console.error('Error fetching entries:', error);
    res.status(500).json({ message: 'Error fetching entries.', error });
  }
});




// bank reports
router.get('/entries/report', async (req, res) => {
  try {
      const { startDate, endDate, bank_name } = req.query;

      // Validate required fields
      if (!startDate || !endDate || !bank_name) {
          return res.status(400).json({ message: 'Start date, end date, and bank name are required.' });
      }

      console.log('Start Date:', new Date(startDate));
      console.log('End Date:', new Date(endDate));
      console.log('Bank Name:', bank_name);

      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); 

      const entries = await DepositWithdrawModel.findAll({
          where: {
              bank_name: {
                  [Op.like]: `%${bank_name}%`, 
              },
              createdAt: {
                  [Op.between]: [start, end],
              },
          },
          order: [['createdAt', 'DESC']],
      });

      console.log('Fetched Entries:', entries);
      const totalAmount = entries.reduce((sum, entry) => sum + Number(entry.amount), 0);

      res.status(200).json({ message: 'Report generated successfully.', data: entries, totalAmount });
  } catch (error) {
      console.error('Error generating report:', error);
      res.status(500).json({ message: 'Error generating report.', error: error.message });
  }
});


  
  

// GET API to fetch all activities by branch
router.get('/branch-activities', async (req, res) => {
  try {
    // Fetch all branches
    const branches = await BranchModel.findAll();

    const activities = await Promise.all(branches.map(async (branch) => {
      const players = await PlayerModel.findAll({ where: { branch_id: branch.id } });

      const playerActivities = await Promise.all(players.map(async (player) => {
        const entries = await DepositWithdrawModel.findAll({ where: { user_id: player.user_id } });
        return { player, entries }; 
      }));

      return { branch, playerActivities }; 
    }));

    res.status(200).json({ message: 'Branch activities retrieved successfully.', data: activities });
  } catch (error) {
    console.error('Error fetching branch activities:', error);
    res.status(500).json({ message: 'Error fetching branch activities.', error });
  }
});

module.exports = router;
