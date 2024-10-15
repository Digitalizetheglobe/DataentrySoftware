const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MergedExcelData = sequelize.define('MergedExcelData', {
  account: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  credit_ref: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  balance: {
    type: DataTypes.DECIMAL,
    allowNull: true,
  },
  exposure: {
    type: DataTypes.DECIMAL,
    allowNull: true,
  },
  available_balance: {
    type: DataTypes.DECIMAL,
    allowNull: true,
  },
  exposure_limit: {
    type: DataTypes.DECIMAL,
    allowNull: true,
  },
  ref_profit_loss: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  date_time: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  uid: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  deposit: {
    type: DataTypes.DECIMAL,
    allowNull: true,
  },
  withdraw: {
    type: DataTypes.DECIMAL,
    allowNull: true,
  },
  remark: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  from_to: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,
});

module.exports = MergedExcelData;
