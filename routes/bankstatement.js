const express = require('express');
const axios = require('axios');

const router = express.Router();

router.get('/bank-statement', async (req, res) => {
  try {
    const { startDate, endDate, bank_name } = req.query;

    if (!startDate || !endDate || !bank_name) {
      return res.status(400).json({ message: 'Start date, end date, and bank name are required.' });
    }

    // Parse dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Format previous day's date to fetch opening balance from
    const prevDate = new Date(start);
    prevDate.setDate(start.getDate() - 1);
    const prevFormattedDate = prevDate.toISOString().split('T')[0];

    // Fetch withdrawal data for the previous day to determine opening balance
    const prevWithdrawalResponse = await axios.get('http://api.cptechsolutions.com/api/withdrawal-report/entries/report', {
      params: { startDate: prevFormattedDate, endDate: prevFormattedDate, bank_name },
    });

    const prevDepositResponse = await axios.get('http://api.cptechsolutions.com/api/deposit-withdraw/entries/report', {
      params: { startDate: prevFormattedDate, endDate: prevFormattedDate, bank_name },
    });

    // Calculate the opening balance based on the previous day's deposits and withdrawals
    const prevTotalWithdrawals = prevWithdrawalResponse.data.totalAmount || 0;
    const prevTotalDeposits = prevDepositResponse.data.totalAmount || 0;

    const openingBalance = prevTotalDeposits - prevTotalWithdrawals;

    // Fetch withdrawal and deposit data for the current date range
    const withdrawalResponse = await axios.get('http://api.cptechsolutions.com/api/withdrawal-report/entries/report', {
      params: { startDate, endDate, bank_name },
    });

    const depositResponse = await axios.get('http://api.cptechsolutions.com/api/deposit-withdraw/entries/report', {
      params: { startDate, endDate, bank_name },
    });

    const totalWithdrawals = withdrawalResponse.data.totalAmount || 0;
    const totalDeposits = depositResponse.data.totalAmount || 0;

    // Calculate closing balance
    const closingBalance = openingBalance + totalDeposits - totalWithdrawals;

    res.status(200).json({
      message: 'Bank Statement generated successfully.',
      data: {
        bank_name,
        startDate,
        endDate,
        openingBalance,
        totalWithdrawals,
        totalDeposits,
        closingBalance,
      },
    });
  } catch (error) {
    console.error('Error generating bank statement:', error);
    res.status(500).json({ message: 'Error generating bank statement.', error: error.message });
  }
});

module.exports = router;
