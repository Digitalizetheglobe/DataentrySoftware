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
// Function to insert data in chunks
const insertInChunks = async (model, data, chunkSize = 1000) => {
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    await model.bulkCreate(chunk);
  }
};

// Upload the two CSV files and store them in separate tables
router.post('/upload', upload.array('files', 2), async (req, res) => {
  try {
    const [file1, file2] = req.files;

    // Process both CSV files
    const data1 = await processCSV(file1.path, true); 
    const data2 = await processCSV(file2.path, false); // Second Excel

    // Save data from each file in chunks to avoid memory issues
    await insertInChunks(ExcelData1, data1);
    await insertInChunks(ExcelData2, data2);

    res.status(200).json({ message: 'Files processed and data stored separately.' });
  } catch (error) {
    console.error('Error processing files:', error);
    res.status(500).json({ message: 'Error processing files', error });
  }
});





// GET API to fetch all data from ExcelData1
router.get('/data1', async (req, res) => {
  try {
    const data1 = await ExcelData1.findAll();
    res.status(200).json({ message: 'ExcelData1 retrieved successfully.', data: data1 });
  } catch (error) {
    console.error('Error fetching data1:', error);
    res.status(500).json({ message: 'Error fetching data1', error });
  }
});

// GET API to fetch all data from ExcelData2
router.get('/data2', async (req, res) => {
  try {
    const data2 = await ExcelData2.findAll();
    res.status(200).json({ message: 'ExcelData2 retrieved successfully.', data: data2 });
  } catch (error) {
    console.error('Error fetching data2:', error);
    res.status(500).json({ message: 'Error fetching data2', error });
  }
});



router.post('/merge', async (req, res) => {
  try {
    // Fetch data from both tables
    const data1 = await ExcelData1.findAll();
    const data2 = await ExcelData2.findAll();

    const matchedResults = [];

    // Convert data2 into a map for easy lookup by `uid`
    const data2Map = new Map(data2.map(item => [item.uid, item]));

    // Iterate through data1 and look for matching `uid` in data2Map
    data1.forEach(item1 => {
      const matchingData2 = data2Map.get(item1.account);

      // Only merge if there is a matching `uid` in data2 for the `account` in data1
      if (matchingData2) {
        const parsedDate = moment(matchingData2.date_time, 'YYYY-MM-DD HH:mm:ss', true);

        const mergedEntry = {
          account: item1.account,
          credit_ref: item1.credit_ref,
          balance: item1.balance + matchingData2.balance, 
          exposure: item1.exposure,
          available_balance: item1.available_balance,
          exposure_limit: item1.exposure_limit,
          ref_profit_loss: item1.ref_profit_loss,
          date_time: parsedDate.isValid() ? parsedDate.toDate() : null,
          uid: matchingData2.uid,
          deposit: matchingData2.deposit,
          withdraw: matchingData2.withdraw,
          remark: matchingData2.remark || '',
          from_to: matchingData2.from_to || '',
        };

        matchedResults.push(mergedEntry);
      }
    });

    await MergedExcelData.destroy({ truncate: true });
    await MergedExcelData.bulkCreate(matchedResults);

    res.status(200).json({ message: 'Data merged successfully.', mergedData: matchedResults });
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

//DELETE ALL REPORT DATA 
router.post('/clear-data', async (req, res) => {
    try {
      // Truncate all tables to remove all data
      //changes checking
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
