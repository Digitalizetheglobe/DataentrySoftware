const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class WithdrawalReportModel extends Model {}

WithdrawalReportModel.init(
  {
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    bank: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    branch_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    remark: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'WithdrawalReport',
    tableName: 'withdrawal_reports',
    timestamps: true,
  }
);

module.exports = WithdrawalReportModel;
