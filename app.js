const express = require('express');
const cors = require('cors'); // Import the CORS package
const sequelize = require('./config/database');
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const excelRoutes = require('./routes/excel');
const MergedExcelData = require('./models/MergedExcelData'); 
const UploadedExcelFile = require('./models/UploadedExcelFile'); 
const userRoutes = require('./routes/userRoutes');
const newUserRoutes = require('./routes/newUserRoutes');
const depositWithdrawRoutes = require('./routes/depositWithdrawRoutes');
const playerRoutes = require('./routes/playerRoutes'); // Import the player routes
const adminRoutes = require('./routes/adminRoutes'); // Import the admin routes

const app = express();

// Enable CORS for all routes and allow requests from http://localhost:3000
app.use(cors({ origin: 'http://localhost:3000' }));

app.use(express.json());

// Register all the routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/excel', excelRoutes); 
app.use('/api/users', userRoutes);
app.use('/api/new-users', newUserRoutes);
app.use('/api/deposit-withdraw', depositWithdrawRoutes);
app.use('/api/players', playerRoutes); // Use player routes
app.use('/api/admin', adminRoutes); // Use admin routes

const PORT = process.env.PORT || 8000;

// Sync models with the database
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
