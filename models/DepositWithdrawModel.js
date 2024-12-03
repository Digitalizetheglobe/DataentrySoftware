const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class DepositWithdrawModel extends Model { }

DepositWithdrawModel.init({
  player_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  branch_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  utr_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  bank_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  remark: {
    type: DataTypes.STRING,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'DepositWithdraw',
  tableName: 'DepositWithdraws'
});

module.exports = DepositWithdrawModel;
