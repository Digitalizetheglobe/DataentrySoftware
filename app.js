const express = require('express');
const cors = require('cors'); 
const sequelize = require('./config/database');
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const excelRoutes = require('./routes/excel');
const MergedExcelData = require('./models/MergedExcelData'); 
const UploadedExcelFile = require('./models/UploadedExcelFile'); 
const userRoutes = require('./routes/userRoutes');
const newUserRoutes = require('./routes/newUserRoutes');
const depositWithdrawRoutes = require('./routes/depositWithdrawRoutes');
const playerRoutes = require('./routes/playerRoutes'); 
const adminRoutes = require('./routes/adminRoutes'); 
const withdrawalReportRoutes = require('./routes/withdrawalReportRoutes');
const reconciliationRoutes = require ('./routes/reconciliationRoutes');
const depositReconciliationRoutes = require('./routes/depositReconciliationRoutes');
const branchRoutes = require('./routes/branch');

const app = express();

// Enable CORS for all routes and allow requests from http://localhost:3000
app.use(cors({ origin: 'http://localhost:3000' }));

app.use(express.json());

// Register all the routes
// Branch routes for registration and login
app.use('/api/branch', branchRoutes);
// // Example of using the auth middleware for a protected route
// app.get('/api/protected', verifyToken, (req, res) => {
//   res.status(200).json({ message: 'This is a protected route', branch_id: req.branch_id });
// });

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/excel', excelRoutes); 
app.use('/api/users', userRoutes);
app.use('/api/new-users', newUserRoutes);
app.use('/api/deposit-withdraw', depositWithdrawRoutes);
app.use('/api/players', playerRoutes); 
app.use('/api/admin', adminRoutes); 
app.use('/api/withdrawal-report', withdrawalReportRoutes);
app.use('/api/withdrawal',reconciliationRoutes);
app.use('/api/deposit', depositReconciliationRoutes);

const PORT = process.env.PORT || 8000;


sequelize.sync({ alter: true })
  .then(() => {
    console.log('Database & tables created!');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Unable to sync the database:', err);
  });
