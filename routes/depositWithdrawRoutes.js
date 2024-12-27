const express = require ('express');
const DepositWithdrawModel = require('../models/DepositWithdrawModel');
const PlayerModel = require('../models/PlayerModel');
const multer = require('multer');
const XLSX = require('xlsx');
const router = express.Router();
const { Op } = require('sequelize');
const moment = require('moment');

// Setup multer for file uploads
const upload = multer({ dest: 'uploads/' });

router.post('/add-entry', async (req, res) => {
  try {
    const { player_id, branch_id, utr_id, amount, bank_name, remark, created_at, bonus } = req.body;

    // Validate required fields
    if (!player_id || !branch_id || !utr_id || !amount || !bank_name) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Check if UTR already exists
    const existingEntry = await DepositWithdrawModel.findOne({ where: { utr_id } });
    if (existingEntry) {
      return res.status(400).json({ message: 'UTR ID already exists. Please use a different UTR ID.' });
    }

      // Convert transaction_date to Date object if necessary
      const formattedDate = new Date(created_at);
      if (isNaN(formattedDate.getTime())) {
        return res.status(400).json({ message: 'Invalid date format.' });
      }
  
    // Directly create the entry in the DepositWithdrawModel
    const newEntry = await DepositWithdrawModel.create({
      player_id,
      branch_id,
      utr_id,
      amount,
      bank_name,
      remark: remark || '',
      created_at: formattedDate,
      bonus: bonus || null,
    });

    res.status(201).json({ message: 'Entry added successfully.', data: newEntry });
  } catch (error) {
    console.error('Error adding entry:', error);
    res.status(500).json({ message: 'Error adding entry.', error });
  }
});

// DELETE API to delete an entry by ID
router.delete('/delete-entry/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the entry exists
    const entry = await DepositWithdrawModel.findByPk(id);
    if (!entry) {
      return res.status(404).json({ message: 'Entry not found.' });
    }

    // Delete the entry
    await entry.destroy();
    res.status(200).json({ message: 'Entry deleted successfully.' });
  } catch (error) {
    console.error('Error deleting entry:', error);
    res.status(500).json({ message: 'Error deleting entry.', error });
  }
});


// Helper function to convert Excel serial dates to JavaScript Date
const parseExcelDate = (serial) => {
  const excelEpoch = new Date(1900, 0, 1); // Excel epoch start date
  return new Date(excelEpoch.getTime() + (serial - 2) * 24 * 60 * 60 * 1000); // Adjust for Excel bug and convert to ms
};

// POST API to upload an Excel file and add entries
router.post('/upload-excel', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an Excel file.' });
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    const results = [];
    const validEntries = [];

    for (const entry of data) {
      const { player_id, branch_id, utr_id, amount, bank_name, remark, date } = entry;
    
      if (!player_id || !branch_id || !utr_id || !amount || !bank_name) {
        results.push({ utr_id: utr_id || 'N/A', status: 'Skipped', message: 'Missing required fields.' });
        continue;
      }
    
      let parsedDate = null;
      if (date) {
        if (typeof date === 'number') {
          // Convert Excel serial date
          parsedDate = parseExcelDate(date);
        } else {
          parsedDate = moment(date, ['DD-MM-YYYY', 'MM-DD-YYYY', 'YYYY-MM-DD'], true);
          if (!parsedDate.isValid()) {
            results.push({
              utr_id,
              status: 'Skipped',
              message: `Invalid date format for "${date}". Expected format: DD-MM-YYYY`,
            });
            continue;
          }
          parsedDate = parsedDate.toDate();
        }
      }
      
    
      // Log the parsed date
      console.log(`Original date: ${date}, Parsed date: ${parsedDate}`);
    
      const existingEntry = await DepositWithdrawModel.findOne({ where: { utr_id } });
      if (existingEntry) {
        results.push({ utr_id, status: 'Skipped', message: 'UTR ID already exists.' });
        continue;
      }
    
      validEntries.push({
        player_id,
        branch_id,
        utr_id,
        amount,
        bank_name,
        remark: remark || '',
        date: parsedDate, 
      });
    
      results.push({ utr_id, status: 'Pending' });
    }
    

    // Bulk insert valid entries
    if (validEntries.length > 0) {
      await DepositWithdrawModel.bulkCreate(validEntries);
      validEntries.forEach((entry, index) => (results[index].status = 'Added'));
    }

    res.status(201).json({ message: 'Entries processed successfully.', results });
  } catch (error) {
    console.error('Error processing Excel file:', error);
    res.status(500).json({ message: 'Error processing Excel file.', error });
  }
});

//---------------------------------------
router.put('/update-entry/:id', async (req, res) => {
  try {
    const { id } = req.params; // Get the entry ID from the route parameter
    const { player_id, branch_id, utr_id, amount, bank_name, remark, created_at } = req.body;

    // Find the existing entry by ID
    const existingEntry = await DepositWithdrawModel.findByPk(id);
    if (!existingEntry) {
      return res.status(404).json({ message: 'Entry not found.' });
    }

    // Check if the UTR ID already exists for another entry
    if (utr_id && utr_id !== existingEntry.utr_id) {
      const utrConflict = await DepositWithdrawModel.findOne({ where: { utr_id } });
      if (utrConflict) {
        return res.status(400).json({ message: 'UTR ID already exists. Please use a different UTR ID.' });
      }
    }

    // Convert the created_at date if necessary
    let formattedDate = existingEntry.created_at; // Default to existing date
    if (created_at) {
      formattedDate = new Date(created_at);
      if (isNaN(formattedDate.getTime())) {
        return res.status(400).json({ message: 'Invalid date format.' });
      }
    }

    // Update the entry with the new data
    const updatedEntry = await existingEntry.update({
      player_id: player_id || existingEntry.player_id,
      branch_id: branch_id || existingEntry.branch_id,
      utr_id: utr_id || existingEntry.utr_id,
      amount: amount || existingEntry.amount,
      bank_name: bank_name || existingEntry.bank_name,
      remark: remark || existingEntry.remark,
      created_at: formattedDate,
    });

    res.status(200).json({ message: 'Entry updated successfully.', data: updatedEntry });
  } catch (error) {
    console.error('Error updating entry:', error);
    res.status(500).json({ message: 'Error updating entry.', error });
  }
});



//---------------------------------------

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
        created_at: {
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
