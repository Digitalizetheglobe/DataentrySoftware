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

        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        // Fetch manual deposit data within the date range
        const manualData = await DepositWithdrawModel.findAll({
            where: {
                createdAt: {
                    [Op.between]: [start, end],
                },
            },
        });

        // Fetch Excel deposit data within the date range
        const excelData = await ExcelData2.findAll({
            where: {
                updatedAt: {
                    [Op.between]: [start, end],
                },
            },
        });

        // Map data for easier comparison
        const excelMap = new Map();
        excelData.forEach(entry => {
            const key = `${entry.uid}-${entry.branch_id}-${Math.abs(entry.deposit)}`; // Use absolute for deposits
            excelMap.set(key, entry);
        });

        const discrepancies = [];
        const matchedRecords = [];

        // Compare manual data against the Excel data
        manualData.forEach(entry => {
            const key = `${entry.player_id}-${entry.branch_id}-${entry.amount}`;
            const excelEntry = excelMap.get(key);

            if (excelEntry) {
                // If a match is found, record it as matched
                matchedRecords.push({
                    player_id: entry.player_id,
                    amount: entry.amount,
                    branch_id: entry.branch_id,
                    date: entry.createdAt,
                    matched: true,
                });
                // Remove the matched entry from the excelMap to keep track of unmatched Excel entries
                excelMap.delete(key);
            } else {
                // If no match is found, record it as a discrepancy
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

        // Remaining entries in excelMap are unmatched Excel entries
        excelMap.forEach((excelEntry) => {
            discrepancies.push({
                player_id: excelEntry.uid,
                amount: excelEntry.deposit,
                branch_id: excelEntry.branch_id,
                date: excelEntry.updatedAt,
                matched: false,
                reason: 'Excel entry not found in Manual',
            });
        });

        // Calculate totals
        const totalManualAmount = manualData.reduce((sum, entry) => sum + entry.amount, 0);
        const totalExcelAmount = excelData.reduce((sum, entry) => sum + Math.abs(entry.deposit), 0); // Ensure positive totals

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
