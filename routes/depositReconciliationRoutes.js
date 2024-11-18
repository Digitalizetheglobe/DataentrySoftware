const express = require('express');
const { Op } = require('sequelize');
const DepositWithdrawModel = require('../models/DepositWithdrawModel');
const ExcelData2 = require('../models/ExcelData2'); 
const router = express.Router();

// GET API for generating deposit reconciliation report
router.get('/deposit-reconciliation-report', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Start date and end date are required.' });
        }

        const start = new Date(`${startDate}T00:00:00Z`);
        const end = new Date(`${endDate}T23:59:59Z`);

        // Fetch manual deposit data
        const manualData = await DepositWithdrawModel.findAll({
            where: { createdAt: { [Op.between]: [start, end] } },
        });

        // Fetch Excel deposit data
        const excelData = await ExcelData2.findAll({
            where: { updatedAt: { [Op.between]: [start, end] } },
        });

        // Log to verify fetched data
        console.log('Manual Data:', manualData);
        console.log('Excel Data:', excelData);

        // Map Excel data
        const excelMap = new Map();
        excelData.forEach(entry => {
            const key = `${entry.uid}-${parseFloat(entry.deposit).toFixed(2)}`;
            excelMap.set(key, entry);
        });

        const discrepancies = [];
        const matchedRecords = [];

        // Compare manual data
        manualData.forEach(entry => {
            const key = `${entry.player_id}-${parseFloat(entry.amount).toFixed(2)}`;
            const excelEntry = excelMap.get(key);

            if (excelEntry) {
                matchedRecords.push({
                    player_id: entry.player_id,
                    amount: entry.amount,
                    branch_id: entry.branch_id,
                    date: entry.createdAt,
                    matched: true,
                });
                excelMap.delete(key); // Remove matched entry
            } else {
                discrepancies.push({
                    player_id: entry.player_id,
                    amount: entry.amount,
                    branch_id: entry.branch_id,
                    date: entry.createdAt,
                    matched: false,
                    reason: 'Manual entry not found in Excel',
                });
            }
        });

        // Handle unmatched Excel entries
        excelMap.forEach((excelEntry) => {
            discrepancies.push({
                player_id: excelEntry.uid,
                amount: excelEntry.deposit,
                branch_id: null,
                date: excelEntry.updatedAt,
                matched: false,
                reason: 'Excel entry not found in Manual',
            });
        });

        // Calculate totals
        const totalManualAmount = manualData.reduce((sum, entry) => sum + entry.amount, 0);
        const totalExcelAmount = excelData.reduce((sum, entry) => sum + Math.abs(entry.deposit), 0);

        res.status(200).json({
            message: 'Deposit Reconciliation report generated successfully.',
            matchedRecords,
            discrepancies,
            totalMatched: matchedRecords.length,
            totalDiscrepancies: discrepancies.length,
            totalManualAmount,
            totalExcelAmount,
        });
    } catch (error) {
        console.error('Error generating deposit reconciliation report:', error);
        res.status(500).json({ message: 'Error generating deposit reconciliation report.', error: error.message });
    }
});


module.exports = router;
