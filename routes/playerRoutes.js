// routes/playerRoutes.js
const express = require('express');
const PlayerModel = require('../models/PlayerModel');
const NewUserModel = require('../models/NewUserModel');
const router = express.Router();

router.post('/register-player', async (req, res) => {
  try {
    const { player_id, branch_id } = req.body;

    if (!player_id || !branch_id) {
      return res.status(400).json({ message: 'Player ID and Branch ID are required.' });
    }

    // Check if branch exists
    const branch = await NewUserModel.findOne({ where: { user_id: branch_id } });
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found.' });
    }

    // Create player
    const newPlayer = await PlayerModel.create({
      player_id,
      branch_id,
      created_at: new Date()
    });

    res.status(201).json({ message: 'Player registered successfully.', data: newPlayer });
  } catch (error) {
    console.error('Error registering player:', error);
    res.status(500).json({ message: 'Error registering player.', error });
  }
});

module.exports = router;
