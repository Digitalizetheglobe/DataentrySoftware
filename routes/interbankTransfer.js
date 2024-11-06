const express = require('express');
const router = express.Router();
const InterBankTransfer = require('../models/InterBankTransfer'); 



router.post('/add-transfer', async (req, res) => {
  const { sender_bank, amount, receiving_bank, utr_id, branch_id , date} = req.body;

  try {
    const newTransfer = await InterBankTransfer.create({
      sender_bank,
      amount,
      receiving_bank,
      utr_id,
      branch_id,
      date,
    });

    res.status(201).json({ message: 'Transfer added successfully', data: newTransfer });
  } catch (error) {
    console.error('Error adding transfer:', error);
    res.status(500).json({ message: 'Error adding transfer', error: error.message });
  }
});

// GET: Retrieve all interbank transfers
router.get('/transfers', async (req, res) => {
  try {
    const transfers = await InterBankTransfer.findAll(); 
    res.status(200).json({ message: 'Transfers retrieved successfully', data: transfers });
  } catch (error) {
    console.error('Error fetching transfers:', error);
    res.status(500).json({ message: 'Error fetching transfers', error: error.message });
  }
});

// working
module.exports = router;
