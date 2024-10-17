// routes/depositWithdrawRoutes.js
const express = require('express');
const DepositWithdrawModel = require('../models/DepositWithdrawModel');
const PlayerModel = require('../models/PlayerModel');
const router = express.Router();

router.post('/add-entry', async (req, res) => {
  try {
    const { player_id, branch_id, utr_id, amount, bank_name, remark } = req.body;

    if (!player_id || !branch_id || !utr_id || !amount || !bank_name) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Check if player exists
    const player = await PlayerModel.findOne({ where: { player_id } });
    if (!player) {
      return res.status(404).json({ message: 'Player not found.' });
    }

    // Add entry to the deposit/withdraw table
    const newEntry = await DepositWithdrawModel.create({
      player_id,
      branch_id,
      utr_id,
      amount,
      bank_name,
      remark: remark || ''
    });

    res.status(201).json({ message: 'Entry added successfully.', data: newEntry });
  } catch (error) {
    console.error('Error adding entry:', error);
    res.status(500).json({ message: 'Error adding entry.', error });
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
          return { player, entries }; // Combine player info with their entries
        }));
  
        return { branch, playerActivities }; // Return activities for this branch
      }));
  
      res.status(200).json({ message: 'Branch activities retrieved successfully.', data: activities });
    } catch (error) {
      console.error('Error fetching branch activities:', error);
      res.status(500).json({ message: 'Error fetching branch activities.', error });
    }
  });





module.exports = router;
