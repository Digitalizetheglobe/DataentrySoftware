const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Adjust this path as per your project structure

const InterBankTransfer = sequelize.define('InterBankTransfer', {
  sender_bank: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  receiving_bank: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  utr_id: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  branch_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY, // This will store the date without time
    allowNull: false,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
});

module.exports = InterBankTransfer;
