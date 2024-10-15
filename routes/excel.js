const express = require('express');
const multer = require('multer');
const fs = require('fs');
const csv = require('csv-parser');
const ExcelData1 = require('../models/ExcelData1');
const ExcelData2 = require('../models/ExcelData2');
const MergedExcelData = require('../models/MergedExcelData');
const router = express.Router();
const moment = require('moment');
const upload = multer({ dest: 'uploads/' });

// Function to process CSV files
const processCSV = (filePath, isFirstFile) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        const rowData = {};
        console.log('Raw CSV Data:', data); 
        
        if (isFirstFile) {
          // First file columns (Excel 1)
          rowData.account = data['account'] || data['Account']; // Try matching both cases
          rowData.credit_ref = data['credit_ref'] || data['Credit Ref.'];
          rowData.balance = parseFloat(data['balance']) || 0;
          rowData.exposure = parseFloat(data['exposure']) || 0;
          rowData.available_balance = parseFloat(data['available_balance']) || 0;
          rowData.exposure_limit = parseFloat(data['exposure_limit']) || 0;
          rowData.ref_profit_loss = parseFloat(data['ref_profit_loss']) || 0;
        } else {
          // Second file columns (Excel 2)
          rowData.uid = data['uid'] || data['UID'];
          rowData.date_time = data['date_time'] || data['Date/Time'];
          rowData.deposit = parseFloat(data['deposit']) || 0;
          rowData.withdraw = parseFloat(data['withdraw']) || 0;
          rowData.balance = parseFloat(data['balance']) || 0;
          rowData.remark = data['remark'] || data['Remark'] || '';
          rowData.from_to = data['from_to'] || data['From/To'] || '';
        }
        
        console.log('Processed Row Data:', rowData); 
        results.push(rowData);
      })
      .on('end', () => {
        console.log('All data processed:', results); 
        resolve(results);
      })
      .on('error', (error) => {
        console.error('Error reading CSV file:', error);
        reject(error);
      });
  });
};


// Upload the two CSV files and store them in separate tables
router.post('/upload', upload.array('files', 2), async (req, res) => {
  try {
    const [file1, file2] = req.files;
    // Process both CSV files
    const data1 = await processCSV(file1.path, true); // First Excel
    const data2 = await processCSV(file2.path, false); // Second Excel

    // Save data from each file separately
    await ExcelData1.bulkCreate(data1);
    await ExcelData2.bulkCreate(data2);

    res.status(200).json({ message: 'Files processed and data stored separately.' });
  } catch (error) {
    console.error('Error processing files:', error);
    res.status(500).json({ message: 'Error processing files', error });
  }
});



router.post('/merge', async (req, res) => {
  try {
    // Fetch data from both tables
    const data1 = await ExcelData1.findAll();
    const data2 = await ExcelData2.findAll();
    const uidMap = new Map();
    data1.forEach(item => {
      uidMap.set(item.account, {
        account: item.account,
        credit_ref: item.credit_ref,
        balance: item.balance,
        exposure: item.exposure,
        available_balance: item.available_balance,
        exposure_limit: item.exposure_limit,
        ref_profit_loss: item.ref_profit_loss,
        date_time: null, 
        uid: null,
        deposit: 0,
        withdraw: 0,
        remark: '',
        from_to: '',
      });
    });
    // Merge data from ExcelData2 using `uid` as the key
    data2.forEach(item => {
      const existingRow = uidMap.get(item.uid); // Match `account` from Excel 1 with `uid` from Excel 2
      if (existingRow) {
        // Parse the date_time using moment.js, or set to null if invalid
        const parsedDate = moment(item.date_time, 'YYYY-MM-DD HH:mm:ss', true);
        existingRow.date_time = parsedDate.isValid() ? parsedDate.toDate() : null;
        
        existingRow.uid = item.uid;
        existingRow.deposit += item.deposit;
        existingRow.withdraw += item.withdraw;
        existingRow.balance += item.balance; // Update balance based on Excel 2 data
        existingRow.remark = item.remark || '';
        existingRow.from_to = item.from_to || '';
      } else {
        // If no match is found, add a new entry with only data from Excel 2
        const parsedDate = moment(item.date_time, 'YYYY-MM-DD HH:mm:ss', true);
        uidMap.set(item.uid, {
          account: null, 
          credit_ref: null,
          balance: item.balance,
          exposure: 0,
          available_balance: 0,
          exposure_limit: 0,
          ref_profit_loss: 0,
          date_time: parsedDate.isValid() ? parsedDate.toDate() : null,
          uid: item.uid,
          deposit: item.deposit,
          withdraw: item.withdraw,
          remark: item.remark || '',
          from_to: item.from_to || '',
        });
      }
    });
    const mergedResults = Array.from(uidMap.values());
    await MergedExcelData.bulkCreate(mergedResults);

    res.status(200).json({ message: 'Data merged successfully.', mergedData: mergedResults });
  } catch (error) {
    console.error('Error merging data:', error);
    res.status(500).json({ message: 'Error merging data', error });
  }
});


// GET API to fetch all merged data
router.get('/merged-data', async (req, res) => {
  try {
    // Fetch all records from the MergedExcelData table
    const mergedData = await MergedExcelData.findAll();

    // Return the data as a JSON response
    res.status(200).json({ message: 'Merged data retrieved successfully.', data: mergedData });
  } catch (error) {
    console.error('Error fetching merged data:', error);
    res.status(500).json({ message: 'Error fetching merged data', error });
  }
});


router.post('/clear-data', async (req, res) => {
    try {
      // Truncate all tables to remove all data
      await ExcelData1.destroy({ truncate: true });
      await ExcelData2.destroy({ truncate: true });
      await MergedExcelData.destroy({ truncate: true });
      await UploadedExcelFile.destroy({ truncate: true });
  
      res.status(200).json({ message: 'All tables have been cleared.' });
    } catch (error) {
      console.error('Error clearing tables:', error);
      res.status(500).json({ message: 'Error clearing tables', error });
    }
  });

module.exports = router;
