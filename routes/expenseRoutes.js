const express = require('express');
const Expense = require('../models/Expense'); 
const router = express.Router();

// Create a new expense /api/expenses/add-expense
router.post('/add-expense', async (req, res) => {
  try {
    const { type_of_expense, amount, bank_name, date, remark, name } = req.body;

    if (!type_of_expense || !amount || !bank_name || !date) {
      return res.status(400).json({ message: 'Type of expense, amount, bank name, and date are required.' });
    }

    const newExpense = await Expense.create({
      type_of_expense,
      amount,
      bank_name,
      date,
      remark,
      name,
    });

    res.status(201).json({ message: 'Expense added successfully.', expense: newExpense });
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({ message: 'Error adding expense.', error: error.message });
  }
});

// Get all expenses
router.get('/expenses', async (req, res) => {
  try {
    const expenses = await Expense.findAll();
    res.status(200).json({ message: 'Expenses retrieved successfully.', data: expenses });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ message: 'Error fetching expenses.', error: error.message });
  }
});

// Get a single expense by ID
router.get('/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findByPk(id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found.' });
    }

    res.status(200).json({ message: 'Expense retrieved successfully.', data: expense });
  } catch (error) {
    console.error('Error fetching expense:', error);
    res.status(500).json({ message: 'Error fetching expense.', error: error.message });
  }
});

// Update an expense
router.put('/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { type_of_expense, amount, bank_name, date, remark, name } = req.body;

    const expense = await Expense.findByPk(id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found.' });
    }

    await expense.update({ type_of_expense, amount, bank_name, date, remark, name });
    res.status(200).json({ message: 'Expense updated successfully.', data: expense });
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ message: 'Error updating expense.', error: error.message });
  }
});

// Delete an expense
router.delete('/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await Expense.findByPk(id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found.' });
    }

    await expense.destroy();
    res.status(200).json({ message: 'Expense deleted successfully.' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ message: 'Error deleting expense.', error: error.message });
  }
});

module.exports = router;
