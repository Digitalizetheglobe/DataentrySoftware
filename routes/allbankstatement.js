const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/bank-statement/generate', async (req, res) => {
    try {
      const { startDate, endDate, bank_name } = req.body;
  
      if (!startDate || !endDate || !bank_name) {
        return res.status(400).json({ message: 'Start date, end date, and bank name are required.' });
      }
  
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
  
      // Fetch Withdrawal Data
      const withdrawalResponse = await axios.get(
        `http://api.cptechsolutions.com/api/withdrawal-report/entries/report?startDate=${startDate}&endDate=${endDate}&bank_name=${bank_name}`
      );
      const withdrawalTotal = withdrawalResponse.data.totalAmount || 0;
  
      // Fetch Deposit Data
      const depositResponse = await axios.get(
        `http://api.cptechsolutions.com/api/deposit-withdraw/entries/report?startDate=${startDate}&endDate=${endDate}&bank_name=${bank_name}`
      );
      const depositTotal = depositResponse.data.totalAmount || 0;
  
      // Fetch Expense Management Data
      const expensesResponse = await axios.get('http://api.cptechsolutions.com/api/expenses/expenses');
      const expenseData = expensesResponse.data.data || []; // Use the `data` field
  
      if (!Array.isArray(expenseData)) {
        return res.status(500).json({
          message: 'Expense data is not in the expected format.',
          fetchedData: expenseData,
        });
      }
  
      const filteredExpenses = expenseData.filter(
        (entry) =>
          entry.bank_name === bank_name &&
          new Date(entry.date) >= start &&
          new Date(entry.date) <= end
      );
      const totalExpenses = filteredExpenses.reduce((sum, entry) => sum + entry.amount, 0);
  
      // Fetch Interbank Transfer Data
      const interbankResponse = await axios.get('http://api.cptechsolutions.com/api/interbank-transfer/transfers');
      const interbankData = interbankResponse.data.data || []; // Use the `data` field
  
      if (!Array.isArray(interbankData)) {
        return res.status(500).json({
          message: 'Interbank transfer data is not in the expected format.',
          fetchedData: interbankData,
        });
      }
  
      const interbankWithdrawals = interbankData.filter(
        (entry) =>
          entry.sender_bank === bank_name &&
          new Date(entry.date) >= start &&
          new Date(entry.date) <= end
      );
      const totalInterbankWithdrawals = interbankWithdrawals.reduce((sum, entry) => sum + entry.amount, 0);
  
      const interbankDeposits = interbankData.filter(
        (entry) =>
          entry.receiving_bank === bank_name &&
          new Date(entry.date) >= start &&
          new Date(entry.date) <= end
      );
      const totalInterbankDeposits = interbankDeposits.reduce((sum, entry) => sum + entry.amount, 0);
  
      // Calculate totals
      const totalWithdrawals = withdrawalTotal + totalExpenses + totalInterbankWithdrawals;
      const totalDeposits = depositTotal + totalInterbankDeposits;
      const openingBalance = 0; // Adjust this based on your requirements
      const closingBalance = openingBalance + totalDeposits - totalWithdrawals;
  
      // Response
      res.status(200).json({
        message: 'Bank statement generated successfully.',
        data: {
          bank_name,
          startDate,
          endDate,
          openingBalance,
          closingBalance,
          totalWithdrawals,
          totalDeposits,
          withdrawalBreakdown: {
            directWithdrawals: withdrawalTotal,
            expenses: totalExpenses,
            interbankWithdrawals: totalInterbankWithdrawals,
          },
          depositBreakdown: {
            directDeposits: depositTotal,
            interbankDeposits: totalInterbankDeposits,
          },
        },
      });
    } catch (error) {
      console.error('Error generating bank statement:', error.message);
      res.status(500).json({
        message: 'Error generating bank statement.',
        error: error.message,
      });
    }
  });
  
  

module.exports = router;
