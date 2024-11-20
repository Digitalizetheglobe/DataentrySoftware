// models/PlayerModel.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class PlayerModel extends Model {}

PlayerModel.init({
  player_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  branch_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'Player',
  tableName: 'Players'
});

module.exports = PlayerModel;
