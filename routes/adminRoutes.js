const express = require('express');
const DepositWithdrawModel = require('../models/DepositWithdrawModel');
const router = express.Router();

router.get('/branch-entries/:branch_id', async (req, res) => {
  try {
    const { branch_id } = req.params;

    // Fetch entries made by the branch
    const entries = await DepositWithdrawModel.findAll({
      where: { branch_id },
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({ message: 'Entries retrieved successfully.', data: entries });
  } catch (error) {
    console.error('Error fetching entries:', error);
    res.status(500).json({ message: 'Error fetching entries.', error });
  }
});

module.exports = router;
