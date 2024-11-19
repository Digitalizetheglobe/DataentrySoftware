// models/Expense.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); 

const Expense = sequelize.define('Expense', {
  type_of_expense: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  bank_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  remark: {
    type: DataTypes.TEXT,
    allowNull: true, 
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true, 
  },
}, {
  timestamps: true, 
});

module.exports = Expense;
