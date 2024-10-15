const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ExcelData2 = sequelize.define('ExcelData2', {
  date_time: DataTypes.STRING,
  uid: DataTypes.STRING,
  deposit: DataTypes.FLOAT,
  withdraw: DataTypes.FLOAT,
  balance: DataTypes.FLOAT,
  remark: DataTypes.STRING,
  from_to: DataTypes.STRING,
}, {
  timestamps: true,
});

module.exports = ExcelData2;
