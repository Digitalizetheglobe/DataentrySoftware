// models/Admin.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Replace with your Sequelize config

const Admin = sequelize.define('Admin', {
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false, // Make it mandatory
    defaultValue: 'admin', // Default to 'admin' if not provided
  },
});

module.exports = Admin;
