// models/DepositWithdrawModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DepositWithdrawModel = sequelize.define('DepositWithdraw', {
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  utr_id: {
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
  branch: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  remark: {
    type: DataTypes.STRING,
  },
});

module.exports = DepositWithdrawModel;
