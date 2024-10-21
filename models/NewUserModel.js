const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class NewUserModel extends Model {}

NewUserModel.init({
  first_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  number: {
    type: DataTypes.STRING,
    allowNull: false,
    // Removed the `unique` constraint from here
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // Email should be unique
    validate: {
      isEmail: true,
    },
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  access_control: {
    type: DataTypes.ENUM('ADMIN', 'SUPER ADMIN', 'MANAGER', 'EDITOR', 'BRANCH'),
    allowNull: false,
  },
  joining_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.STRING,
    unique: true, // User ID should be unique
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'NewUserModel',
  tableName: 'NewUser',
});

module.exports = NewUserModel;
