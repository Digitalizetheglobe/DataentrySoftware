const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); 

class Branch extends Model {}

Branch.init({
  branch_id: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Branch',
});

module.exports = Branch;
