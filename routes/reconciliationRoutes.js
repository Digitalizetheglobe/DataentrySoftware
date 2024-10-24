const express = require('express');
const { Op } = require('sequelize');
const ExcelData2 = require('../models/ExcelData2'); 
const WithdrawalReportModel = require('../models/WithdrawalReportModel'); 
const router = express.Router();

// GET API for generating reconciliation report
router.get('/reconciliation-report', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Start date and end date are required.' });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        // Fetch Excel data within the date range
        const excelData = await ExcelData2.findAll({
            where: {
                updatedAt: {
                    [Op.between]: [start, end],
                },
            },
        });

        // Fetch manual withdrawal data within the date range
        const manualData = await WithdrawalReportModel.findAll({
            where: {
                date: {
                    [Op.between]: [start, end],
                },
            },
        });
    // Calculate totals for each data set
    const totalManualAmount = manualData.reduce((sum, entry) => sum + entry.amount, 0);
    const totalExcelAmount = excelData.reduce((sum, entry) => sum + Math.abs(entry.withdraw), 0); // Use Math.abs if withdraw values are negative

        // Map data for easier comparison
        const excelMap = new Map();
        excelData.forEach(entry => {
            const key = `${entry.uid}`;
            excelMap.set(key, entry);
        });

        const discrepancies = [];
        const matchedRecords = [];

        // Compare manual data against the Excel data
        manualData.forEach(entry => {
            const key = `${entry.user_id}`;
            const excelEntry = excelMap.get(key);

            if (excelEntry) {
                // Check if the withdrawal amounts match
                const manualAmount = parseFloat(entry.amount);
                const excelAmount = Math.abs(parseFloat(excelEntry.withdraw)); // Using absolute value to handle negatives

                if (manualAmount === excelAmount) {
                    matchedRecords.push({
                        user_id: entry.user_id,
                        amount: entry.amount,
                        branch_id: entry.branch_id,
                        date: entry.date,
                        matched: true,
                    });
                } else {
                    // If the amounts do not match
                    discrepancies.push({
                        user_id: entry.user_id,
                        amount: entry.amount,
                        branch_id: entry.branch_id,
                        date: entry.date,
                        matched: false,
                        reason: 'Amount mismatch',
                        excelAmount: excelAmount,
                        manualAmount: manualAmount
                    });
                }

                // Remove the matched entry from the excelMap to keep track of unmatched Excel entries
                excelMap.delete(key);
            } else {
                // If no match is found in Excel data, record it as a discrepancy
                discrepancies.push({
                    user_id: entry.user_id,
                    amount: entry.amount,
                    branch_id: entry.branch_id,
                    date: entry.date,
                    matched: false,
                    reason: 'Manual entry not found in Excel',
                });
            }
        });

        // Remaining entries in excelMap are unmatched Excel entries
        excelMap.forEach((excelEntry) => {
            discrepancies.push({
                user_id: excelEntry.uid,
                amount: excelEntry.withdraw,
                branch_id: excelEntry.branch_id,
                date: excelEntry.updatedAt,
                matched: false,
                reason: 'Excel entry not found in Manual',
            });
        });

        res.status(200).json({
            message: 'Reconciliation report generated successfully.',
            matchedRecords,
            discrepancies,
            totalMatched: matchedRecords.length,
            totalDiscrepancies: discrepancies.length, 
            totalManualAmount,
            totalExcelAmount,
        });
    } catch (error) {
        console.error('Error generating reconciliation report:', error);
        res.status(500).json({ message: 'Error generating reconciliation report.', error: error.message });
    }
});

module.exports = router;
