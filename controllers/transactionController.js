const Transaction = require('../models/Transaction');

exports.createTransaction = async (req, res) => {
  const { utr, amount, type, proof_of_payment } = req.body;

  try {
    const transaction = await Transaction.create({
      utr,
      amount,
      type,
      proof_of_payment,
      user_id: req.user.id,
    });

    res.status(201).json({ message: 'Transaction created successfully', transaction });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.findAll({ where: { user_id: req.user.id } });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
