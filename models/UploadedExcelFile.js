const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User'); // Import the User model

const UploadedExcelFile = sequelize.define('UploadedExcelFile', {
  file_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  uploaded_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  processed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  uploaded_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  remarks: {
    type: DataTypes.TEXT,
  },
}, {
  timestamps: true,
});

// Define associations
User.hasMany(UploadedExcelFile, { foreignKey: 'uploaded_by' });
UploadedExcelFile.belongsTo(User, { foreignKey: 'uploaded_by' });

module.exports = UploadedExcelFile;
