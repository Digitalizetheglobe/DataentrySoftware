const express = require('express');
const { createTransaction, getTransactions } = require('../controllers/transactionController');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/', auth, createTransaction);
router.get('/', auth, getTransactions);

module.exports = router;
