const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ExcelData1 = sequelize.define('ExcelData1', {
  account: DataTypes.STRING,
  credit_ref: DataTypes.STRING,
  balance: DataTypes.FLOAT,
  exposure: DataTypes.FLOAT,
  available_balance: DataTypes.FLOAT,
  exposure_limit: DataTypes.FLOAT,
  ref_profit_loss: DataTypes.FLOAT,
}, {
  timestamps: true,
});

module.exports = ExcelData1;
